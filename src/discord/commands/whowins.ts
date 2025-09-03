import { ChatError } from '@/utils/chatError';
import { cyrb128, useRNG } from '@/utils/random';
import { toId } from '@/utils/toId';

import type { NoTranslate } from '@/i18n/types';
import type { DiscordCommand } from '@/types/chat';

export const command: DiscordCommand = {
	name: 'whowins',
	desc: 'Picks between two people to win!',
	servers: ['729992843925520474'],
	args: slash =>
		slash
			.addStringOption(opt => opt.setName('a').setDescription('One side').setRequired(true))
			.addStringOption(opt => opt.setName('b').setDescription('The other side').setRequired(true)),
	async run(interaction) {
		const [A, B] = [interaction.options.getString('a'), interaction.options.getString('b')]
			.sortBy(str => toId(str ?? ''))
			.map(term => term?.trim());

		if (!toId(A ?? '') || !toId(B ?? '')) throw new ChatError('Dono sides ke naam de do!' as NoTranslate);
		if (!A || !B) return; // TS

		const seedString = [toId(A), toId(B)].join('|');
		const seedNum = cyrb128(seedString)[0];

		const rng = useRNG(seedNum);
		const winner = [A, B].random(rng)!;
		const difficulty = ['aaraam se', 'mushkil se', 'barely'].random(rng)!;

		interaction.reply(`${winner} ${winner === A ? B : A} ko ${difficulty} hara paaenge.`);
	},
};
