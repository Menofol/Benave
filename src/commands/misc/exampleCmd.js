const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("test")
        .setDescription("Проверка")
        .setDMPermission(false)
        .addSubcommandGroup((subcommandgroup) => 
         subcommandgroup
            .setName("user")
            .setDescription("Настройка пользвоателя.")
            .addSubcommand((subcommand) => 
             subcommand
                .setName("role")
                .setDescription("Настройка роли.")
                .addUserOption((option) => 
                    option.setName("user").setDescription("Пользователь для настройки.")
                )
            )
            .addSubcommand((subcommand) => 
             subcommand
                .setName("nickname")
                .setDescription("Введите ник для пользователя")
                .addStringOption((option) => 
                 option
                    .setName("nickname")
                    .setDescription("Никнейм который должен быть.")
            )
            .addUserOption((option) => 
             option.setName("user").setDescription("Пользователь для настройки")
            )
        )
    )
    .addSubcommandGroup((subcommand) => 
     subcommand.setName("message").setDescription("Настройка сообщения.")
    )
    .toJSON(),
    userPermissions: [PermissionFlagsBits.ManageMessages],
    botPermissions: [PermissionFlagsBits.Connect],

    run: (client, interaction) => {
        return interaction.reply({ content: "Проверка завершена", ephemeral: true });
    }
};