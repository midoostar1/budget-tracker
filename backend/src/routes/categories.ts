import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { createCategorySchema } from '../validation';
import { z } from 'zod';

const router = Router();

/**
 * GET /categories - Get all categories
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = storage.getCategories();
    res.json(categories.map(c => storage.categoryToDTO(c)));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /categories - Create a new category
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = createCategorySchema.parse(req.body);

    const category = storage.createCategory({
      name: validatedData.name,
      color: validatedData.color,
      icon: validatedData.icon,
    });

    res.status(201).json(storage.categoryToDTO(category));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;