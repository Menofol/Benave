const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const mConfig = require("../../messageConfig.json");
const moderationSchema = require("../../schemas/moderation");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("Вернуть с бана пожилого.")
        .addStringOption((o) => o
            .setName("user_id")
            .setDescription("Укажите ИД.")
            .setRequired(true)
            )
            .toJSON()
        ,
        userPermissions: [PermissionFlagsBits.ManageMessages],
        botPermissions: [PermissionFlagsBits.BanMembers],

        run: async (client, interaction) => {
            const { options, guildId, guild, member } = interaction;

            const userId = options.getString("user_id")

            let data = await moderationSchema.findOne({ GuildID: guildId });
            if (!data) {
                rEmbed
                    .setColor(mConfig.embedColorError)
                    .setDescription(`\`❌\` Система еще не настроенна.\n\n\`💡\` Используй \`/moderatesystem configure\` что бы начать настройку.`);
                return interaction.reply({ embeds: [rEmbed], ephemeral: true });
            };
    
            if (userId.id === member.id) {
                rEmbed
                    .setColor(mConfig.embedColorError)
                    .setDescription(`${mConfig.unableToInteractWithYourself}`);
                    return interaction.reply({ embeds: [rEmbed], ephemeral: true });
            };
            guild.members.unban(userId);

            const rEmbed = new EmbedBuilder()
                .setColor(mConfig.embedColorSuccess)
                .setFooter({ text: `${client.user.username} - разбанен` })
                .setDescription(`\`✅\` Холоп с \`${userId}\` успешно вынес с базы.`);
                
            interaction.reply({ embeds: [rEmbed], ephemeral: true });
        },
};