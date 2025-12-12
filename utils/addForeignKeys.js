/**
 * Add foreign key constraints to the games table if they don't exist
 * This is a workaround for Sequelize's sync({ alter: true }) not always creating foreign keys
 */
async function addGameForeignKeys(sequelize) {
  const queryInterface = sequelize.getQueryInterface();

  // Try to add each foreign key constraint
  // They will fail gracefully if they already exist
  const constraints = [
    {
      fields: ["player1_id"],
      name: "games_player1_id_fkey",
    },
    {
      fields: ["player2_id"],
      name: "games_player2_id_fkey",
    },
    {
      fields: ["winner_id"],
      name: "games_winner_id_fkey",
    },
  ];

  for (const constraint of constraints) {
    try {
      await queryInterface.addConstraint("games", {
        fields: constraint.fields,
        type: "foreign key",
        name: constraint.name,
        references: {
          table: "users",
          field: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      console.log(`Added foreign key constraint: ${constraint.name}`);
    } catch (error) {
      // Ignore errors if constraint already exists
      const errorMessage = error.message || "";
      if (
        !errorMessage.includes("already exists") &&
        !errorMessage.includes("duplicate") &&
        !errorMessage.includes("constraint")
      ) {
        console.error(`Error adding ${constraint.name}:`, error.message);
      }
    }
  }
}

module.exports = { addGameForeignKeys };
