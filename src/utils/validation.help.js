// ValidationHelper.js
const ValidationHelper = {
    exists: async (UserModel, query) => {
      try {
        const user = await UserModel.findOne(query);
        return !!user; // Return true if the user exists, false otherwise
      } catch (error) {
        console.error('Error checking user existence:', error);
        throw error; // Propagate the error if there's an issue with the database query
      }
    },
  };
  
  module.exports = ValidationHelper;
  