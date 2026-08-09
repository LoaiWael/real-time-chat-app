import express from "express";
import User from '../models/user.model.js';
import { verifyWebhook } from '@clerk/express/webhooks';

const router = express.Router();

router.post('/', async (req, res) => {
  const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!signingSecret) {
    res.status(503).send('Webhook signing secret not configured');
    return;
  }

  try {
    const evt = await verifyWebhook(req);
    const { id } = evt.data;
    const eventType = evt.type;

    console.log(`Received Clerk webhook with ID ${id} and event type of ${eventType}`);

    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id: clerkId, email_addresses, first_name, last_name, image_url } = evt.data;

      const primaryEmail = email_addresses && email_addresses.length > 0 
        ? email_addresses[0].email_address 
        : '';
      const fullName = `${first_name || ''} ${last_name || ''}`.trim() || 'User';

      await User.findOneAndUpdate(
        { clerkId },
        {
          clerkId,
          email: primaryEmail,
          fullName,
          profilePic: image_url,
        },
        { upsert: true, new: true }
      );
    } else if (eventType === 'user.deleted') {
      const { id: clerkId } = evt.data;
      await User.findOneAndDelete({ clerkId });
    }

    res.status(200).json({ success: true, message: 'Webhook processed successfully' });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    res.status(400).send('Error verifying webhook');
  }
});

export default router;