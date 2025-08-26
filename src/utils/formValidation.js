export function validateForm(obj, schema) {
    const res = schema.safeParse(obj);
    if(!res.success) {
      const err = res.error.flatten();
      return err.fieldErrors;
    }
    
    return null;
  }
  