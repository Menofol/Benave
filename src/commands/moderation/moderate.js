const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const mConfig = require("../../messageConfig.json");
const moderationSchema = require("../../schemas/moderation");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("moderate")
    .setDescription("Наказать геяру.")
    .addUserOption((o) => o
        .setName("user")
        .setDescription("Укажите кого хотите наказать.")
        .setRequired(true)
      )
      .toJSON()
    ,
    userPermissions: [PermissionFlagsBits.ManageMessages],
    botPermissions: [],

    run: async (client, interaction) => {
        const { options, guildId, guild, member } = interaction;

        const user = options.getUser("user");
        const targetMember = await guild.members.fetch(user);

        const rEmbed = new EmbedBuilder()
            .setColor("FFFFFF")
            .setFooter({ text: `${client.user.username} - наказаный член союза.`});

        let data = await moderationSchema.findOne({ GuildID: guildId });
        if (!data) {
            rEmbed
                .setColor(mConfig.embedColorError)
                .setDescription(`\`❌\` Система еще не настроенна.\n\n\`💡\` Используй \`/moderatesystem configure\` что бы начать настройку.`);
            return interaction.reply({ embeds: [rEmbed], ephemeral: true });
        };

        if (targetMember.id === member.id) {
            rEmbed
                .setColor(mConfig.embedColorError)
                .setDescription(`${mConfig.unableToInteractWithYourself}`);
                return interaction.reply({ embeds: [rEmbed], ephemeral: true });
        };

        if (targetMember.roles.highest.position >= member.roles.highest.position) {
            rEmbed
                .setColor(mConfig.embedColorError)
                .setDescription(`${mConfig.hasHigherRolePosition}`);
                return interaction.reply({ embeds: [rEmbed], ephemeral: true });
        };

        const moderationButtons = new ActionRowBuilder().setComponents(
            new ButtonBuilder().setCustomId("banBtn").setLabel("Бан").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("kickBtn").setLabel("Кик").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("cancelBtn").setLabel("Отмена").setStyle(ButtonStyle.Secondary)
        );

        rEmbed
            .setAuthor({
                name: `${targetMember.user.username}`,
                iconURL: `${targetmember.user.displayAvatarURL({ dynamic: true })}`
            })
            .setDescription(`\`❔\` Какое наказние выберите для ${targetmember.user.username}?`);

        interaction.reply({ embeds: [rEmbed], components: [moderationButtons] });
    },
};