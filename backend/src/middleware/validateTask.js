export const validateTask = (req, res, next) => {
  const { title,description, dueDate, status, priority } = req.body;

  const now = new Date();
  
  if (req.method === 'POST') {
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is a required field.' });
    }
    if (!description || description.trim() === '') {
      return res.status(400).json({ error: 'description is a required field.' });
    }
    if (!dueDate || isNaN(Date.parse(dueDate))) {
      return res.status(400).json({ error: 'A valid due date is a required field.' });
    }
    if (new Date(dueDate) < now) {
      return res.status(400).json({ error: 'Due date cannot be a past date or time.' });
    }
  }

  if (req.method === 'PUT') {
    if (title !== undefined && title.trim() === '') {
      return res.status(400).json({ error: 'Title cannot be empty.' });
    }
    if (dueDate !== undefined && isNaN(Date.parse(dueDate))) {
      return res.status(400).json({ error: 'Provided due date is invalid.' });
    }
    if (new Date(dueDate) < now) {
      return res.status(400).json({ error: 'Due date cannot be a past date or time.' });
    }
  }

  const validStatuses = ['todo', 'in_progress', 'completed','missed']; 
  if (status !== undefined && !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  const validPriorities = ['low', 'medium', 'high'];
  if (priority !== undefined && !validPriorities.includes(priority)) {
    return res.status(400).json({ error: `Priority must be one of: ${validPriorities.join(', ')}` });
  }

  next();
};