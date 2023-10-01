const { PermissionFlagsBits } = require("discord.js");

module.exports = {
    customId: "canceBtn",
    userPermissions: [],
    botPermissions: [],

    run: async (client, interaction) => {
        await interaction.message.delete();
    },
};