import Discord from 'discord.js';
import ms from 'ms';
import config from '../../config';
import CommandFile from '../interfaces/CommandFile';

export default class CommandHelpers {
    public static loadArguments(interaction: Discord.CommandInteraction): any {
        let options = interaction.options.data;
        let args = {};
        for(let i = 0; i < options.length; i++) {
            args[options[i].name] = options[i].value;
        }
        return args;
    }
    public static checkPermissions(command: CommandFile, user: Discord.GuildMember): boolean {
        if(command.commandData.useDiscordPermissionSystem) {
            let permissionsRequired = command.commandData.permissions as Discord.PermissionResolvable[];
            for(let i = 0; i < permissionsRequired.length; i++) {
                if(user.permissions.has(permissionsRequired[i])) return true;
            }
            return false;
        } else {
            let roleIDsRequired = command.commandData.permissions as string[];
            if(!roleIDsRequired) return true;
            roleIDsRequired = roleIDsRequired.concat(config.permissions.all);
            if(user.roles.cache.some(role => roleIDsRequired.includes(role.id))) return true;
            return false;
        }
    }
    public static parseReasons(usernames: string[], rawReasons: any): {parsedReasons: string[], didError: boolean} {
        if(!rawReasons) {
            let reasons = [];
            while(true) {
                if(reasons.length === usernames.length) break;
                reasons.push("No reason provided");
            }
            return {parsedReasons: reasons, didError: false};
        } else {
            let reasons = rawReasons.split(",");
            if(reasons.length === 1) {
                while(true) {
                    if(reasons.length === usernames.length) break;
                    reasons.push(reasons[0]);
                }
                return {parsedReasons: reasons, didError: false};
            } else if(reasons.length !== usernames.length) {
                return {parsedReasons: [], didError: true};
            }
        }
    }
    public static parseTimes(usernames: string[], rawTimes: any): {parsedTimes: number[], didError: boolean} {
        let times = rawTimes.replaceAll(" ", "").split(",");
        if(times.length === 1) {
            if(!ms(times[0])) {
                return {parsedTimes: [], didError: true};
            }
            times[0] = ms(times[0]);
            while(true) {
                if(times.length === usernames.length) break;
                times.push(times[0]);
            }
            return {parsedTimes: times, didError: false};
        } else if(times.length === usernames.length) {
            let newTimes = [];
            for(let i = 0; i < times.length; i++) {
                let newTime = ms(times[i]);
                if(!newTime) return {parsedTimes: [], didError: true};
                newTimes.push(newTime);
            }
            return {parsedTimes: newTimes, didError: false};
        } else {
            return {parsedTimes: [], didError: true};
        }
    }
    public static parseUniverses(): Discord.APIApplicationCommandOptionChoice[] {
        let universes = config.universes;
        let parsed: Discord.APIApplicationCommandOptionChoice[] = [];
        for(let i = 0; i < universes.length; i++) {
            parsed.push({name: universes[i].universeDisplayName, value: universes[i].universeDisplayName});
        }
        return parsed;
    }
    public static getUniverseIDFromName(name: string): number {
        return config.universes.find(v => v.universeDisplayName === name).universeID;
    }
}