const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require("discord.js")
const moderationSchema = require("../../schemas/moderation");
const mConfig = require("../../messageConfig.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("moderatesystem")
        .setDescription("Система модерирования.")
        .addSubcommand((s) => s
            .setName("configure")
            .setDescription("Настройте систему модерирование на сервере.")
            .addChannelOption((o) => o
                .setName("logging_channel")
                .setDescription("Канал, в котором будет выводиться сообщения.")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
                )
            )
            .addSubcommand((s) => s
                .setName("remove")
                .setDescription("Удалить систему модерирования.")
                )
                .toJSON()
            ,
            userPermissions: [PermissionFlagsBits.Administrator],
            botPermissions: [],

            run: async (client, interaction) => {
                const { options, guildId, guild } = interaction;
                const subcmd = options.getSubcommand();
                if (!["configure", "romove"].includes(subcmd)) return;

                const rEmbed = new EmbedBuilder()
                    .setFooter({
                        iconURL: `${client.user.displayAvatarURL({ dynamic: true })}`,
                        text: `${client.user.username} - Система модерирования`
                    });
                
                switch (subcmd) {
                    case "configure":
                        const loggingChannel = options.getChannel("logging_channel");

                        let dataGD = await moderationSchema.findOne({ GuildID: guildId });
                        if (!dataGD) {
                            rEmbed
                                .setColor(mConfig.embedColorWarning)
                                .setDescription(`\`⏳\` Обнаружен новый сервер: Начат сбор данных для настройки системы модерирование...`);
                            
                            await interaction.reply({ embeds: [rEmbed], fetchReply: true, ephermeral: true });

                            dataGD = new moderationSchema({
                                GuildID: guildId,
                                LogChannelID: loggingChannel.ig
                            });
                            dataGD.save();

                            rEmbed
                                .setColor(mConfig.embedColorSucces)
                                .setDescription(`\`✅\` Успешная настройка системы модерирование.`)
                                .addFields(
                                    { name: "Logging channel", value: `${loggingChannel}`, inline: true }
                                );

                            setTimeout(() => {
                                interaction.editReply({ embeds: [rEmbed], ephermeral: true });
                            }, 2_000);
                        } else {
                            await moderationSchema.findOneAndUpdate({ GuildID: guild}, { LogChannelID: loggingChannel.id });

                            rEmbed
                                .setColor(mConfig.embedColorSucces)
                                .setDescription(`\`✅\` Система успеншно изменила данные.`)
                                .addFields(
                                    { name: "Канал для логов", value: `${loggingChannel}`, inline: true }
                                );

                                interaction.reply({ embeds: [rEmbed], ephermeral: true });
                        };
                        break;
                    case "remove":
                        const removed = await moderationSchema.findOneAndDelete({ GuildID: guildId });
                        if(remove) {
                            rEmbed
                                .setColor(mConfig.embedColorSucces)
                                .setDescription(`\`✅\` Система успеншно удалена.`)
                        } else {
                            rEmbed
                                .setColor(mConfig.embedColorError)
                                .setDescription(`\`❌\` Система еще не настроенна.\n\n\`💡\` Используй \`/moderatesystem configure\` что бы начать настройку.`);
                        }
                        interaction.reply({ embeds: [rEmbed], ephermeral: true });
                        break;                
                    };
            },
};