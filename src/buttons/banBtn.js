const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const mConfig = require("../../messageConfig.json");
const moderationSchema = require("../../schemas/moderation");

module.exports = {
    customId: "banBtn",
    userPermissions: [],
    botPermissions: [PermissionFlagsBits.BanMembers],

    run: async (client, interaction) => {
        const { message, channel, guildId, guild, user } = interaction;

        const embedAuthor = message.embeds[0].author;
        const fetchdMembers = await guild.members.fetch({ query: embedAuthor.name, limit: 1 });
        const targetMember = fetchMembers.first();

        const rEmbed = new EmbedBuilder()
            .setColor("FFFFFF")
            .setFooter({ text: `${cleint.user.username} - наказан` })
            .setAuthor({ name: `${targetMember.user.username}`, iconURL: `${targetmember.user.displayAvatarURL({ dynamic: true })}`})
            .setDescription(`\`❔\` Какова причина для бана ${targetMember.user.username}?\n\`❕\` У вас имеется 15 секунд для ответа, по окончанию времени все отмениться автоматически.\n\n\`💡\` Что бы продолжить без причины, ответьте \`-\`\`💡\` Что бы отменить решение, ответьте \`отмена\``);

        message.edit({ embeds: [rEmbed], components: [] });

        const filter = (m) => m.author.id === user.id;
        const reasonCollector = await channel.awaitMessages({ filter, max: 1, time: 15_000, errors: ["time"] })
            .then((reason) => {
                if (reason.first().content.toLowerCase() === "отмена") {
                    reason.first().delete();
                    rEmbed
                        .setColor(mConfig.embedColorError)
                        .setDescription(`\`❌\` Наказание отменено.`);
                    message.edit({ embeds: [rEmbed] });
                    setTimeout(() => {
                        message.delete();
                    }, 2_000);
                    return;
                };
                return reason;
            })
            .catch(() => {
                rEmbed
                    .setColor(mConfig.embedColorError)
                    .setDescription(`\`❌\` Наказание отменено.`);
                message.edit({ embeds: [rEmbed] });
                setTimeout(() => {
                    message.delete();
                }, 2_000);
                return;
            });
        const reasonObj = reasonCollector?.first();
        if (!reasonObj) return;

        let reason = reasonObj.content;
        if (reasonObj.content === "-") {
            reason = "Причина не указана."
        };
        reasonObj.delete();

        targetMember.ban({ reason: `${reason}`, deleMessageSeconds: 60 * 60 * 24 * 7 });

        let dataGD = await moderationSchema.findOne({ GuildID: guildId });
        const { LogChannelID } = dataGD;
        const loggingChannel = guild.channels.cache.get(LogChannelID);

        const lEmbed = new EmbedBuilder()
            .setColor("FFFFFF")
            .setTitle("`❌\` Участник забанен")
            .setAuthor({ name: targetMember.user.username, iconURL: targetMember.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`\`💡\` Для разбана ${targetMember.user.username}, используйте \`/unban ${targetMember.user.id}\` что бы разблокировать.`)
            .addFields(
                { name: "Забанил", value: `<@${user.id}>`, inline: true },
                { name: "Причина", value: `${reason}`, inline: true }
            )
            .setFooter({ iconURL: client.user.displayAvatarURL({ dynamic: true }), text: `${client.user.username} - логирование действий`})
        loggingChannel.send({ embeds: [lEmbed] });

        rEmbed
            .setColor(mConfig.embedColorSuccess)
            .setDescription(`\`✅\` Успешно заблокирован ${targetMember.user.username}.`);

        message.edit({ embeds: [rEmbed] });
        setTimeout(() => {
            message.delete();
        }, 2_000);
    },
};