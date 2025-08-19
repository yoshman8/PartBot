import type { DiscordCommand } from '@/types/chat';

export const command: DiscordCommand = {
	name: 'test',
	desc: 'Test command',
	run(interaction) {
		return interaction.reply('Test');
	},
};
