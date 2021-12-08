import * as Colors from './Colors';
export { Colors };
import { MessageEmbed, ColorResolvable, Guild, GuildMember, User, MessageButton, Role, Channel, RoleResolvable } from 'discord.js';
import moment from 'moment';

import { client } from '../';

export function resolveUser(args: any, guild: Guild): GuildMember {
	const user: GuildMember | boolean = guild.members.cache.find((user) => {
		if (user.user.id.toLowerCase() == args.toLowerCase()) return true;
		else if (user.user.username.toLowerCase() == args.toLowerCase())
			return true;
		else if (user.user.tag.toLowerCase() == args.toLowerCase()) return true;
		else if (
			user.displayName &&
			user.displayName.toLowerCase() == args.toLowerCase()
		)
			return true;
		else return false;
	});

	if (user) return user;
}

interface EmbedOptions {
	Title?: string;
	Description?: string;
	Footer?: {
		Text: string;
		IconUrl?: string;
	};
	Thumbnail?: string;
	Image?: string;
	Timestamp?: any;
	Color?: string;
	Url?: string;
	Author?: string;
	AuthorIcon?: string;
	AuthorUrl?: string;
	Fields?: { Name: any; Value: any; Inline: any }[];
}

interface CreateEmbedOption {
	options: EmbedOptions;
	variables?: {
		searchFor: RegExp | string;
		replaceWith: any;
	}[];
}

export function parseVariables(prefix: string, user: GuildMember): CreateEmbedOption['variables'] {
	if (prefix) return [
		{ searchFor: new RegExp(`${prefix}-id`, 'g'), replaceWith: user.id },
		{ searchFor: new RegExp(`${prefix}-displayname`, 'g'), replaceWith: user.displayName },
		{ searchFor: new RegExp(`${prefix}-username`, 'g'), replaceWith: user.user.username },
		{ searchFor: new RegExp(`${prefix}-tag`, 'g'), replaceWith: user.user.tag },
		{ searchFor: new RegExp(`${prefix}-mention`, 'g'), replaceWith: `<@${user.id}>` },
		{ searchFor: new RegExp(`${prefix}-pfp`, 'g'), replaceWith: user.user.displayAvatarURL({ dynamic: true }) },
		{ searchFor: new RegExp(`${prefix}-createdat`, 'g'), replaceWith: moment(user.user.createdAt).format("MMMM Do YYYY. h:mm a") },
	]
	else return [
		{ searchFor: /{user-id}/g, replaceWith: user.id },
		{ searchFor: /{user-displayname}/g, replaceWith: user.displayName },
		{ searchFor: /{user-username}/g, replaceWith: user.user.username },
		{ searchFor: /{user-tag}/g, replaceWith: user.user.tag },
		{ searchFor: /{user-mention}/g, replaceWith: `<@${user.id}>` },
		{ searchFor: /{user-pfp}/g, replaceWith: user.user.displayAvatarURL({ dynamic: true }) },
		{ searchFor: /{user-createdat}/g, replaceWith: moment(user.user.createdAt).format("MMMM Do YYYY. h:mm a") },
	]
}

export async function createEmbed(_options: CreateEmbedOption, member: GuildMember): Promise<MessageEmbed> {
	const { options } = _options;

	// Registering Veriables
	let Title = options.Title ? options.Title : '';
	let Description = options.Description ? options.Description : '';
	let FooterText, FooterIcon;
	if (options.Footer) {
		FooterText = options.Footer.Text ? options.Footer.Text : '';
		FooterIcon = options.Footer.IconUrl ? options.Footer.IconUrl : '';
	}
	let Image = options.Image ? options.Image : '';
	let Thumbnail = options.Thumbnail ? options.Thumbnail : '';
	let Timestamp = options.Timestamp ? options.Timestamp : '';
	let Color = options.Color || '2f3136';
	let Url = options.Url ? options.Url : '';
	let Fields = options.Fields ? options.Fields : undefined;
	let Author = options.Author ? options.Author : '';
	let AuthorIcon = options.AuthorIcon ? options.AuthorIcon : '';
	let AuthorUrl = options.AuthorUrl ? options.AuthorUrl : '';
	let _fields = [];

	// Replacing Placeholders
	if (_options.variables) {
		for (let variable of parseVariables(null, member)) _options.variables.push(variable)
		for (let variable of _options.variables) {
			if (Title) Title = Title.replace(variable.searchFor, variable.replaceWith);
			if (Description) Description = Description.replace(variable.searchFor, variable.replaceWith);
			if (FooterText) FooterText = FooterText.replace(variable.searchFor, variable.replaceWith);
			if (FooterIcon) FooterIcon = FooterIcon.replace(variable.searchFor, variable.replaceWith);
			if (Image) Image = Image.replace(variable.searchFor, variable.replaceWith);
			if (Thumbnail) Thumbnail = Thumbnail.replace(variable.searchFor, variable.replaceWith);
			if (Timestamp) Timestamp = Timestamp.replace(variable.searchFor, variable.replaceWith);
			if (Url) Url = Url.replace(variable.searchFor, variable.replaceWith);
			if (Author) Author = Author.replace(variable.searchFor, variable.replaceWith);
			if (AuthorIcon) AuthorIcon = AuthorIcon.replace(variable.searchFor, variable.replaceWith);
			if (AuthorUrl) AuthorUrl = AuthorUrl.replace(variable.searchFor, variable.replaceWith);
		}
	}

	// Fields Management
	if (Fields) {
		for (let i = 0; i < Fields.length; i++) {
			const field = Fields[i];
			let data = {
				name: field.Name || '\u200B',
				value: field.Value || '\u200B',
				inline: field.Inline || false,
			};
			if (_options.variables) {
				for (let a = 0; a < _options.variables.length; a++) {
					const variable = _options.variables[a];
					data.name = data.name.replace(variable.searchFor, variable.replaceWith);
					data.value = data.value.replace(variable.searchFor, variable.replaceWith);
				}
			}
			_fields.push(data);
		}
	}

	// Creating actual embed
	const embed = new MessageEmbed();

	if ((!Title && !Description && !Author) || (Title == '' && Description == '' && Author == '')) {
		embed.setTitle('⚠️ Missing Embed Values');
		client.logger.error('⚠️  Missing Embed Values');
		return embed;
	}

	if (Title) embed.setTitle(Title);
	if (Description) embed.setDescription(Description);
	if (FooterText && FooterIcon) embed.setFooter(FooterText, FooterIcon);
	else if (FooterText) embed.setFooter(FooterText);
	if (Image) embed.setImage(Image);
	if (Thumbnail) embed.setThumbnail(Thumbnail);
	if (Color) embed.setColor(`#${Color}`);
	if (Url) embed.setURL(Url);
	if (Fields && Fields.length) _fields.forEach((field) => embed.addField(field.name, field.value, field.inline));
	if (Author) {
		if (AuthorIcon && !AuthorUrl) embed.setAuthor(Author, AuthorIcon);
		else if (AuthorUrl && AuthorIcon) embed.setAuthor(Author, AuthorIcon, AuthorUrl);
		else if (AuthorUrl && !AuthorIcon) embed.setAuthor(Author, null, AuthorUrl);
		else embed.setAuthor(Author);
	}
	if (Timestamp) embed.setTimestamp(Timestamp);

	return embed;
}

interface ButtonOptions {
	Text: string
	Emoji?: string
	CustomID: string
	Link?: string,
	Color: 'blurple' | 'grey' | 'green' | 'red' | 'url' | 'primary' | 'secondary' | 'success' | 'danger' | 'link' | string,
	isEnabled: boolean
}

export function calculateButton(options: ButtonOptions) {
	let Text = options.Text;
	let Emoji = options.Emoji ? options.Emoji : null;
	let CustomID = options.CustomID ? options.CustomID : null;
	let isEnabled = options.isEnabled;
	let Link = options.Link ? options.Link : null;

	let Color;
	switch (options.Color.toLowerCase()) {
		case 'blurple':
		case 'primary': {
			Color = 1
			break;
		}

		case 'grey':
		case 'secondary': {
			Color = 2
			break;
		}

		case 'green':
		case 'success': {
			Color = 3
			break;
		}
		case 'red':
		case 'danger': {
			Color = 4
			break;
		}
		case 'url':
		case 'link': {
			Color = 5
			break;
		}
	}

	if (!CustomID) {
		client.logger.error('Variable \`CustomID\` was not passed in Button');
		return;
	}

	let button = new MessageButton()
	if (Text) button.setLabel(Text);
	if (Color) button.setStyle(Color);
	if (Emoji) button.setEmoji(Emoji);
	if (isEnabled) button.setDisabled(!isEnabled);
	if ((Color == 'url' || Color == 5) && Link) button.setURL(Link);
	if (CustomID && !((Color == 'url' || Color == 5) && Link)) button.setCustomId(CustomID);

	return button;
}

export function findRole(role: string, guild: Guild): Role | void {
	let _role = guild.roles.cache.find(r => r.name.toLowerCase() == role.toLowerCase() || r.id == role.toLowerCase());
	if (!_role) {
		client.logger.warn(`${role} was not found in the ${guild.name} guild`);
		return undefined;
	}
	return _role;
}

export function hasRole(role: any, member: GuildMember): boolean {
	let _role = findRole(role.id, member.guild);
	return (_role ? (member.roles.cache.has(_role.id) ? true : false) : false);
}

export function findChannel(channelName: string, guild: Guild) {
	let channel = guild.channels.cache.find(c => c.name.toLowerCase() == channelName.toLowerCase() || c.id == channelName);
	if (!channel) {
		client.logger.warn(`${channelName} was not found in ${guild.name} guild`)
		return undefined
	}
	return channel;
}