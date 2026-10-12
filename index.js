const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const PREFIX = '#';

// ═══════════════════════════════════════
// عند التشغيل
// ═══════════════════════════════════════
client.once('ready', () => {
    console.log(`✅ البوت شغال: ${client.user.tag}`);
    console.log(`📊 عدد السيرفرات: ${client.guilds.cache.size}`);
});

// ═══════════════════════════════════════
// 👋 الترحيب بالأعضاء الجدد
// ═══════════════════════════════════════
client.on('guildMemberAdd', async (member) => {
    try {
        // ابحث عن قناة الترحيب (الاسم يحتوي كلمة "ترحيب" أو "welcome")
        const welcomeChannel = member.guild.channels.cache.find(
            ch => ch.name.includes('ترحيب') || ch.name.includes('welcome') || ch.name.includes('استقبال')
        );

        if (!welcomeChannel) {
            console.log('⚠️ ما لقيت قناة ترحيب');
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle('🎉 عضو جديد!')
            .setDescription(
                `مرحباً بك ${member} في **${member.guild.name}**!\n\n` +
                `👤 اسمك: **${member.user.username}**\n` +
                `🔢 أنت العضو رقم: **${member.guild.memberCount}**\n\n` +
                `نورتنا! 🌟`
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .setColor(0x00d4ff)
            .setFooter({ text: member.guild.name })
            .setTimestamp();

        await welcomeChannel.send({ content: `${member}`, embeds: [embed] });
        console.log(`👋 رحبنا بـ ${member.user.username}`);
    } catch (e) {
        console.log('❌ خطأ في الترحيب:', e.message);
    }
});

// ═══════════════════════════════════════
// 💬 استقبال الأوامر
// ═══════════════════════════════════════
client.on('messageCreate', async (message) => {
    try {
        if (message.author.bot) return;
        if (!message.content.startsWith(PREFIX)) return;

        const args = message.content.slice(PREFIX.length).trim().split(/ +/);
        const command = args[0];

        console.log(`📨 ${message.author.username}: ${message.content}`);

        // ═══ #مساعدة ═══
        if (command === 'مساعدة' || command === 'help') {
            const embed = new EmbedBuilder()
                .setTitle('📜 أوامر البوت')
                .setDescription('الأوامر المتاحة (للمشرفين فقط):')
                .addFields(
                    { name: '🔒 #قفل', value: 'يقفل القناة الحالية (منع الكتابة)', inline: false },
                    { name: '🔓 #فتح', value: 'يفتح القناة الحالية', inline: false },
                    { name: '📜 #مساعدة', value: 'يعرض هذه القائمة', inline: false }
                )
                .setColor(0x00d4ff)
                .setFooter({ text: message.guild.name })
                .setTimestamp();
            await message.channel.send({ embeds: [embed] });
            return;
        }

        // ═══ بقية الأوامر تحتاج صلاحية ═══
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply('❌ هذا الأمر للمشرفين فقط');
        }

        // ═══ #قفل ═══
        if (command === 'قفل') {
            try {
                await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                    SendMessages: false
                });
                const embed = new EmbedBuilder()
                    .setTitle('🔒 تم قفل القناة')
                    .setDescription(`القناة ${message.channel} الآن **مقفلة**\nما يقدر أحد يكتب فيها`)
                    .setColor(0xff0040)
                    .setTimestamp();
                await message.channel.send({ embeds: [embed] });
                console.log(`🔒 قفل: ${message.channel.name}`);
            } catch (e) {
                message.reply('❌ فشل القفل: ' + e.message);
            }
            return;
        }

        // ═══ #فتح ═══
        if (command === 'فتح') {
            try {
                await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                    SendMessages: null
                });
                const embed = new EmbedBuilder()
                    .setTitle('🔓 تم فتح القناة')
                    .setDescription(`القناة ${message.channel} الآن **مفتوحة**\nالجميع يقدر يكتب`)
                    .setColor(0x00ff87)
                    .setTimestamp();
                await message.channel.send({ embeds: [embed] });
                console.log(`🔓 فتح: ${message.channel.name}`);
            } catch (e) {
                message.reply('❌ فشل الفتح: ' + e.message);
            }
            return;
        }

    } catch (e) {
        console.log('❌ خطأ:', e.message);
    }
});

// ═══════════════════════════════════════
// تسجيل الدخول
// ═══════════════════════════════════════
client.login(process.env.DISCORD_TOKEN);
console.log('🚀 البوت بدأ...');
