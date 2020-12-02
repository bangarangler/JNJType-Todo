//? Note: If you have another type of error you know you will be using, be wary of using this function and figure out how you want to deal with things from there (maybe an object or string that details what should be sent off?  Choose your own adventure!)

export function catchTypeChecker(error: any) {
  // This checks if this is an InputError
  console.log("typeof error :>> ", typeof error);
  if (Array.isArray(error)) {
    return { inputErrors: error };
  }
  // general error
  return { error: { message: error } };
}
