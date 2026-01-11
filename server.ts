// server.ts - Next.js Standalone + Socket.IO
import { setupSocket } from '@/lib/socket';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';
import cron from 'node-cron';
import webpush from 'web-push';
import { db } from '@/lib/db';

const dev = process.env.NODE_ENV !== 'production';
const currentPort = 3000;
const hostname = '0.0.0.0';

// Custom server with Socket.IO integration
async function createCustomServer() {
  try {
    // Create Next.js app
    const nextApp = next({ 
      dev,
      dir: process.cwd(),
      // In production, use the current directory where .next is located
      conf: dev ? undefined : { distDir: './.next' }
    });

    await nextApp.prepare();
    const handle = nextApp.getRequestHandler();

    // Create HTTP server that will handle both Next.js and Socket.IO
    const server = createServer((req, res) => {
      // Skip socket.io requests from Next.js handler
      if (req.url?.startsWith('/api/socketio')) {
        return;
      }
      handle(req, res);
    });

    // Setup Socket.IO
    const io = new Server(server, {
      path: '/api/socketio',
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    setupSocket(io);

    // Setup Web Push
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

    if (vapidPublicKey && vapidPrivateKey) {
      webpush.setVapidDetails(
        'mailto:support@example.com',
        vapidPublicKey,
        vapidPrivateKey
      );
      console.log('Web Push Configured');
    }

    // Setup Cron Job
    // Run every day at 10:00 AM
    cron.schedule('0 10 * * *', async () => {
      console.log('Running daily cron job check...');
      const today = new Date();
      const date = today.getDate();

      // Only run between 1st and 10th
      if (date >= 1 && date <= 10) {
        console.log('Running monthly deposit reminder check...');
        try {
            const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
            const currentYear = today.getFullYear();

            const members = await db.member.findMany({
                include: {
                    subscriptions: true,
                    contributions: {
                        where: {
                            month: currentMonth,
                            year: currentYear
                        }
                    }
                }
            });

            let sentCount = 0;
            for (const member of members) {
                if (member.contributions.length === 0) {
                    // Has not paid
                    if (member.subscriptions.length > 0) {
                        const notificationPayload = JSON.stringify({
                            title: 'Monthly Deposit Reminder',
                            body: `Dear ${member.name}, please pay your deposit for ${currentMonth}/${currentYear}.`,
                            icon: '/icon-192x192.png',
                            url: `/member/${member.accountNumber}`
                        });

                        for (const sub of member.subscriptions) {
                            try {
                                // Parse keys if they are stored as JSON string, otherwise use directly
                                const subscription = {
                                    endpoint: sub.endpoint,
                                    keys: typeof sub.keys === 'string' ? JSON.parse(sub.keys) : sub.keys
                                };
                                await webpush.sendNotification(subscription as any, notificationPayload);
                                sentCount++;
                            } catch (error) {
                                console.error('Error sending push:', error);
                            }
                        }
                    }
                }
            }
            console.log(`Reminders sent to ${sentCount} devices.`);
        } catch(e) {
            console.error("Cron job error", e);
        }
      }
    });

    // Start the server
    server.listen(currentPort, hostname, () => {
      console.log(`> Ready on http://${hostname}:${currentPort}`);
      console.log(`> Socket.IO server running at ws://${hostname}:${currentPort}/api/socketio`);
    });

  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
}

// Start the server
createCustomServer();
