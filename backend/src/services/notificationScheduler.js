import cron from 'node-cron';
import { prisma } from '../config/prisma.js';

export const initNotificationScheduler = (io) => {
  // Runs every single minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      // Fix lines 10 & 11 in notificationScheduler.js
      const startOfMinute = new Date(now.getTime());
      startOfMinute.setSeconds(0, 0);

      const endOfMinute = new Date(now.getTime());
      endOfMinute.setSeconds(59, 999);

      // ==========================================
      // TYPE 1: REMINDER (X minutes BEFORE due date)
      // ==========================================
      const reminderTasks = await prisma.$queryRaw`
        SELECT * FROM "taskDB"."tasks"
        WHERE "status"::text NOT IN ('completed', 'missed')
        AND ("dueDate" - ("reminderMin" * INTERVAL '1 minute')) >= ${startOfMinute}
        AND ("dueDate" - ("reminderMin" * INTERVAL '1 minute')) <= ${endOfMinute};
      `;

      reminderTasks.forEach(task => {
        console.log(`🚨 Task reminder alert emitted for: ${task.title}`);
        io.emit('notification', {
          type: 'reminder',
          taskId: task.id,
          userId: task.userId,
          message: `⚠️ Reminder: Your task "${task.title}" is due in ${task.reminderMin} minutes.`
        });
      });

      // ==========================================
      // TYPE 2: DUE NOW (Exactly AT the due time)
      // ==========================================
      const dueNowTasks = await prisma.$queryRaw`
        SELECT * FROM "taskDB"."tasks"
        WHERE "status"::text IN ('todo', 'in_progress') 
        AND "dueDate" >= ${startOfMinute}
        AND "dueDate" <= ${endOfMinute};
      `;

      dueNowTasks.forEach(task => {
        console.log(`🚨 Task due alert emitted for: ${task.title}`);
        io.emit('notification', {
          type: 'due_now',
          taskId: task.id,
          userId: task.userId,
          message: `⏰ Urgent: Your task "${task.title}" is due right now!`
        });
      });

      // ==========================================
      // TYPE 3: MISSED (Exactly 1 minute AFTER due date)
      // ==========================================
      // By adding 1 minute to the dueDate check, we catch tasks that expired last minute
      const missedTasks = await prisma.$queryRaw`
        SELECT * FROM "taskDB"."tasks"
        WHERE "status"::text IN ('todo', 'in_progress')
        AND ("dueDate" + INTERVAL '1 minute') >= ${startOfMinute}
        AND ("dueDate" + INTERVAL '1 minute') <= ${endOfMinute};
      `;

      if (missedTasks.length > 0) {
        // Mark them as missed in the DB
        await prisma.$executeRaw`
          UPDATE "taskDB"."tasks"
          SET "status" = 'missed'
          WHERE "status"::text IN ('todo', 'in_progress')
          AND ("dueDate" + INTERVAL '1 minute') >= ${startOfMinute}
          AND ("dueDate" + INTERVAL '1 minute') <= ${endOfMinute};
        `;

        // Send the alert 1 minute late
        missedTasks.forEach(task => {
          console.log(`🚨 Task missed alert emitted for: ${task.title}`);
          io.emit('notification', {
            type: 'missed',
            taskId: task.id,
            userId: task.userId,
            message: `❌ Missed Deadline: Your task "${task.title}" was due 1 minute ago and has been marked as missed.`
          });
        });
      }

    } catch (error) {
      console.error('Notification Scheduler Error:', error);
    }
  });
};