import type { DiscordCommand } from '@/types/chat';

export const command: DiscordCommand = {
	name: 'bonk',
	desc: 'Bonks!',
	servers: ['226909807548825600', '776284091813068830', '719076445699440700'],
	run(interaction) {
		return interaction.reply('https://emoji.gg/assets/emoji/9749_bonk.png');
	},
};
