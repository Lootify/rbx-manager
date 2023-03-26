import Discord from 'discord.js';

import BotClient from '../../../utils/classes/BotClient';
import CommandFile from '../../../utils/interfaces/CommandFile';
import MessagingService from '../../../utils/classes/MessagingService';
import CommandHelpers from '../../../utils/classes/CommandHelpers';

import config from '../../../config';

const messaging = new MessagingService(config);

const command: CommandFile = {
    run: async(interaction: Discord.CommandInteraction<Discord.CacheType>, client: BotClient, args: any): Promise<any> => {
        let typeOfOperation = args["type"];
        let code = args["code"];
        let jobID = args["jobid"];
        let universeName = args["universe"];
        let universeID = CommandHelpers.getUniverseIDFromName(universeName);
        if(typeOfOperation === "jobID" && !jobID) {
            let embed = client.embedMaker({title: "Argument Error", description: "You didn't supply a Job ID even though you supplied the jobID execution type", type: "error", author: interaction.user});
            return await interaction.editReply({embeds: [embed]});
        }
        try {
            await messaging.sendMessage(universeID, "Eval", {
                isGlobal: (typeOfOperation === "global"),
                code: code,
                jobID: jobID
            });
        } catch(e) {
            let embed = client.embedMaker({title: "Error", description: `There was an error while trying to send this code for execution: ${e}`, type: "error", author: interaction.user});
            return await interaction.editReply({embeds: [embed]});
        }
        if(typeOfOperation === "global") {
            await client.logAction(`<@${interaction.user.id}> has executed **${code}** in all of the servers of **${universeName}**`);
        } else {
            await client.logAction(`<@${interaction.user.id}> has executed **${code}** the server of **${universeName}** with the job ID of **${jobID}**`);
        }
        let embed = client.embedMaker({title: "Success", description: "You've successfully sent out the following code to be executed based on the inputted settings", type: "success", author: interaction.user});
        await interaction.editReply({embeds: [embed]});
    },
    slashData: new Discord.SlashCommandBuilder()
    .setName("eval")
    .setDescription("Runs serverside code on either all servers or a specific one")
    .addStringOption(o => o.setName("universe").setDescription("The universe to perform this action on").setRequired(true).addChoices(...CommandHelpers.parseUniverses() as any))
    .addStringOption(o => o.setName("type").setDescription("The type of execution to preform").setRequired(true).addChoices({name: "global", value: "global"}, {name: "jobID", value: "jobID"}))
    .addStringOption(o => o.setName("code").setDescription("The code to execute in the game").setRequired(true))
    .addStringOption(o => o.setName("jobid").setDescription("The job ID of the server you wish to run the code in (only if you choose so)").setRequired(false)) as Discord.SlashCommandBuilder,
    commandData: {
        category: "General Game",
        permissions: config.permissions.game.execution
    },
    hasCooldown: true
}

export default command;