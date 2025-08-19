import { evaluate } from '@/eval';
import { i18n } from '@/i18n';

import type { DiscordCommand } from '@/types/chat';

// With a 100-character buffer
const DISCORD_MAX_MSG_LENGTH = 1900;

export const command: DiscordCommand = {
	name: 'eval',
	aliases: ['run', 'exec'],
	desc: 'Evaluates code. Only for the administrator of the Bot.',
	perms: 'admin',
	args: slash => slash.addStringOption(builder => builder.setName('code').setDescription('The code to evaluate.').setRequired(true)),
	async run(message) {
		const $T = i18n();

		const code = message.options.getString('code')!;
		const shortOutput = message.commandName === 'exec';
		const res = await evaluate(code, shortOutput ? 'ABBR_OUTPUT' : 'COLOR_OUTPUT_ANSI', { message, context: null });
		if (shortOutput) {
			message.reply(res.success ? $T('COMMANDS.EVAL.SUCCESS') : $T('COMMANDS.EVAL.ERROR', { error: res.output }));
		} else {
			const output = res.output.length > DISCORD_MAX_MSG_LENGTH ? res.output.slice(0, DISCORD_MAX_MSG_LENGTH) + ' ...' : res.output;
			message.reply({ content: `\`\`\`ansi\n${output}\n\`\`\``, ephemeral: message.commandName !== 'run' });
		}
	},
};
