import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import User from '../models/User';
import AccountProvider from '../models/AccountProvider';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get current user profile
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get linked providers
    const providers = await AccountProvider.find({ userId: user._id });

    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
      },
      linkedProviders: providers.map(p => ({
        provider: p.provider,
        linkedAt: p.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const { name, profilePicture } = req.body;

    const user = await User.findById(req.user!.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name) user.name = name;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Example protected endpoint
router.get('/data', async (req: Request, res: Response) => {
  res.json({
    message: 'This is protected data',
    userId: req.user!.id,
  });
});

export default router;
