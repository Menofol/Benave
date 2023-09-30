require("color");

const { EmbedBuilder } = require("discord.js");
const { developersId, testServerId } = require("../../config.json");
const mConfig = require("../../messageConfig.json");
const getLocalContextMenus = require("../../utils/getLocalContextMenus");

module.exports = async (client, interaction) => {
    if (!interaction.isContextMenuCommand()) return;
    const localContextMenus = getLocalCommands();

    try {
        const menuObject = getLocalContextMenus.find((cmd) => cmd.data.name === interaction.commandName);
        if (!menuObject) return;

        if (menuObject.devOnly) {
            if (!developersId.includes(interaction.member.id)) {
                const rEmbed = EmbedBuilder()
                    .setColor(`${mConfig.embedColorError}`)
                    .setDescription(`${mConfig.commandDevolyn}`);
                interaction.reply({ embeds: [rEmbed], ephermeral: true });
                return;
            };
        };

        if (menuObject.testMode) {
            if (interaction.guild.id !== testServerId ) {
                const rEmbed = EmbedBuilder()
                   .setColor(`${mConfig.embedColorError}`)
                   .setDescription(`${mConfig.commandTestMode}`);
                interaction.reply({ embeds: [rEmbed], ephermeral: true });
                return;
            };
        };

        if (menuObject.userPermissions?.length) {
            for (const permission of menuObject.userPermissions) {
                if (interaction.member.permissons.has(permission)) {
                    continue;
                };
                const rEmbed = new EmbedBuilder()
                    .setColor(`${mConfig.embedColorError}`)
                    .setDescription(`${mConfig.userNoPermissions}`);
                interaction.reply({ embeds: [rEmbed], ephermeral: true });
                return;
            };
        };

        if (menuObject.botPermissions?.length) {
            for (const permission of menuObject.botPermissions) {
                const bot = interaction.guild.members.me;
                if(bot.permissions.has(permission)) {
                    continue;
                };
                const rEmbed = new EmbedBuilder()
                    .setColor(`${mConfig.embedColorError}`)
                    .setDescription(`${mConfig.userNoPermissions}`);
                interaction.reply({ embeds: [rEmbed], ephermeral: true });
                return;
            };
        };

        await menuObject.run(client, interaction);
    } catch (err) {
        console.log(`An error occurred! ${err}`.red);
    };
};