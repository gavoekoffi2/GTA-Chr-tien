// Contenu : versets (Louis Segond 1910 / King James), grades et missions.
const v = (rf, re, tf, te) => ({ ref: [rf, re], text: [tf, te] });
export const VERSES = {
  jn3_16: v('Jean 3:16', 'John 3:16', "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle.", 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.'),
  rm10_9: v('Romains 10:9', 'Romans 10:9', "Si tu confesses de ta bouche le Seigneur Jésus, et si tu crois dans ton cœur que Dieu l'a ressuscité des morts, tu seras sauvé.", 'That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved.'),
  co5_17: v('2 Corinthiens 5:17', '2 Corinthians 5:17', 'Si quelqu’un est en Christ, il est une nouvelle créature. Les choses anciennes sont passées; voici, toutes choses sont devenues nouvelles.', 'Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new.'),
  ac2_38: v('Actes 2:38', 'Acts 2:38', 'Repentez-vous, et que chacun de vous soit baptisé au nom de Jésus-Christ, pour le pardon de vos péchés; et vous recevrez le don du Saint-Esprit.', 'Repent, and be baptized every one of you in the name of Jesus Christ for the remission of sins, and ye shall receive the gift of the Holy Ghost.'),
  mt6_6: v('Matthieu 6:6', 'Matthew 6:6', 'Mais quand tu pries, entre dans ta chambre, ferme ta porte, et prie ton Père qui est là dans le lieu secret; et ton Père, qui voit dans le secret, te le rendra.', 'But thou, when thou prayest, enter into thy closet, and when thou hast shut thy door, pray to thy Father which is in secret; and thy Father which seeth in secret shall reward thee openly.'),
  ps119_105: v('Psaume 119:105', 'Psalm 119:105', 'Ta parole est une lampe à mes pieds, Et une lumière sur mon sentier.', 'Thy word is a lamp unto my feet, and a light unto my path.'),
  he10_25: v('Hébreux 10:25', 'Hebrews 10:25', "N'abandonnons pas notre assemblée, comme c'est la coutume de quelques-uns; mais exhortons-nous réciproquement, et cela d'autant plus que vous voyez s'approcher le jour.", 'Not forsaking the assembling of ourselves together, as the manner of some is; but exhorting one another: and so much the more, as ye see the day approaching.'),
  mc10_45: v('Marc 10:45', 'Mark 10:45', "Car le Fils de l'homme est venu, non pour être servi, mais pour servir et donner sa vie comme la rançon de plusieurs.", 'For even the Son of man came not to be ministered unto, but to minister, and to give his life a ransom for many.'),
  co9_7: v('2 Corinthiens 9:7', '2 Corinthians 9:7', "Que chacun donne comme il l'a résolu en son cœur, sans tristesse ni contrainte; car Dieu aime celui qui donne avec joie.", 'Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver.'),
  ep4_32: v('Éphésiens 4:32', 'Ephesians 4:32', 'Soyez bons les uns envers les autres, compatissants, vous pardonnant réciproquement, comme Dieu vous a pardonné en Christ.', "And be ye kind one to another, tenderhearted, forgiving one another, even as God for Christ's sake hath forgiven you."),
  p3_15: v('1 Pierre 3:15', '1 Peter 3:15', "Soyez toujours prêts à vous défendre, avec douceur et respect, devant quiconque vous demande raison de l'espérance qui est en vous.", 'Be ready always to give an answer to every man that asketh you a reason of the hope that is in you with meekness and fear.'),
  rm1_16: v('Romains 1:16', 'Romans 1:16', "Car je n'ai point honte de l'Évangile: c'est une puissance de Dieu pour le salut de quiconque croit.", 'For I am not ashamed of the gospel of Christ: for it is the power of God unto salvation to every one that believeth.'),
  jn14_6: v('Jean 14:6', 'John 14:6', 'Jésus lui dit: Je suis le chemin, la vérité, et la vie. Nul ne vient au Père que par moi.', 'Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.'),
  co10_13: v('1 Corinthiens 10:13', '1 Corinthians 10:13', "Aucune tentation ne vous est survenue qui n'ait été humaine, et Dieu, qui est fidèle, ne permettra pas que vous soyez tentés au delà de vos forces; mais avec la tentation il préparera aussi le moyen d'en sortir, afin que vous puissiez la supporter.", 'There hath no temptation taken you but such as is common to man: but God is faithful, who will not suffer you to be tempted above that ye are able; but will with the temptation also make a way to escape, that ye may be able to bear it.'),
  ep6_11: v('Éphésiens 6:11', 'Ephesians 6:11', 'Revêtez-vous de toutes les armes de Dieu, afin de pouvoir tenir ferme contre les ruses du diable.', 'Put on the whole armour of God, that ye may be able to stand against the wiles of the devil.'),
  mt4_4: v('Matthieu 4:4', 'Matthew 4:4', "Il est écrit: L'homme ne vivra pas de pain seulement, mais de toute parole qui sort de la bouche de Dieu.", 'It is written, Man shall not live by bread alone, but by every word that proceedeth out of the mouth of God.'),
  tm2_2: v('2 Timothée 2:2', '2 Timothy 2:2', "Et ce que tu as entendu de moi en présence de beaucoup de témoins, confie-le à des hommes fidèles, qui soient capables de l'enseigner aussi à d'autres.", 'And the things that thou hast heard of me among many witnesses, the same commit thou to faithful men, who shall be able to teach others also.'),
  ga6_2: v('Galates 6:2', 'Galatians 6:2', 'Portez les fardeaux les uns des autres, et vous accomplirez ainsi la loi de Christ.', "Bear ye one another's burdens, and so fulfil the law of Christ."),
  pr22_6: v('Proverbes 22:6', 'Proverbs 22:6', "Instruis l'enfant selon la voie qu'il doit suivre; Et quand il sera vieux, il ne s'en détournera pas.", 'Train up a child in the way he should go: and when he is old, he will not depart from it.'),
  mc16_15: v('Marc 16:15', 'Mark 16:15', 'Allez par tout le monde, et prêchez la bonne nouvelle à toute la création.', 'Go ye into all the world, and preach the gospel to every creature.'),
  ga5_22: v('Galates 5:22', 'Galatians 5:22-23', "Mais le fruit de l'Esprit, c'est l'amour, la joie, la paix, la patience, la bonté, la bénignité, la fidélité, la douceur, la tempérance.", 'But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, meekness, temperance.'),
  tm4_7: v('2 Timothée 4:7', '2 Timothy 4:7', "J'ai combattu le bon combat, j'ai achevé la course, j'ai gardé la foi.", 'I have fought a good fight, I have finished my course, I have kept the faith.'),
  lc10_27: v('Luc 10:27', 'Luke 10:27', 'Tu aimeras le Seigneur, ton Dieu, de tout ton cœur, de toute ton âme, de toute ta force, et de toute ta pensée; et ton prochain comme toi-même.', 'Thou shalt love the Lord thy God with all thy heart, and with all thy soul, and with all thy strength, and with all thy mind; and thy neighbour as thyself.'),
  mt25_40: v('Matthieu 25:40', 'Matthew 25:40', "Toutes les fois que vous avez fait ces choses à l'un de ces plus petits de mes frères, c'est à moi que vous les avez faites.", 'Inasmuch as ye have done it unto one of the least of these my brethren, ye have done it unto me.'),
  mt5_9: v('Matthieu 5:9', 'Matthew 5:9', 'Heureux ceux qui procurent la paix, car ils seront appelés fils de Dieu!', 'Blessed are the peacemakers: for they shall be called the children of God.'),
  pr15_1: v('Proverbes 15:1', 'Proverbs 15:1', 'Une réponse douce calme la fureur, Mais une parole dure excite la colère.', 'A soft answer turneth away wrath: but grievous words stir up anger.'),
  lc15_24: v('Luc 15:24', 'Luke 15:24', 'Car mon fils que voici était mort, et il est revenu à la vie; il était perdu, et il est retrouvé.', 'For this my son was dead, and is alive again; he was lost, and is found.'),
  lc16_10: v('Luc 16:10', 'Luke 16:10', "Celui qui est fidèle dans les moindres choses l'est aussi dans les grandes.", 'He that is faithful in that which is least is faithful also in much.'),
  pr11_1: v('Proverbes 11:1', 'Proverbs 11:1', "La balance fausse est en horreur à l'Éternel, Mais le poids juste lui est agréable.", 'A false balance is abomination to the LORD: but a just weight is his delight.'),
  jc5_15: v('Jacques 5:15', 'James 5:15', 'La prière de la foi sauvera le malade, et le Seigneur le relèvera.', 'And the prayer of faith shall save the sick, and the Lord shall raise him up.'),
  col3_23: v('Colossiens 3:23', 'Colossians 3:23', 'Tout ce que vous faites, faites-le de bon cœur, comme pour le Seigneur et non pour des hommes.', 'And whatsoever ye do, do it heartily, as to the Lord, and not unto men.'),
  he13_3: v('Hébreux 13:3', 'Hebrews 13:3', 'Souvenez-vous des prisonniers, comme si vous étiez aussi prisonniers.', 'Remember them that are in bonds, as bound with them.'),
  tm4_12: v('1 Timothée 4:12', '1 Timothy 4:12', 'Que personne ne méprise ta jeunesse; mais sois un modèle pour les fidèles, en parole, en conduite, en charité, en foi, en pureté.', 'Let no man despise thy youth; but be thou an example of the believers, in word, in conversation, in charity, in spirit, in faith, in purity.'),
  he13_16: v('Hébreux 13:16', 'Hebrews 13:16', "Et n'oubliez pas la bienfaisance et la libéralité, car c'est à de tels sacrifices que Dieu prend plaisir.", 'But to do good and to communicate forget not: for with such sacrifices God is well pleased.'),
  es41_10: v('Ésaïe 41:10', 'Isaiah 41:10', 'Ne crains rien, car je suis avec toi; Ne promène pas des regards inquiets, car je suis ton Dieu; Je te fortifie, je viens à ton secours, Je te soutiens de ma droite triomphante.', 'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.'),
  co13_4: v('1 Corinthiens 13:4', '1 Corinthians 13:4', "La charité est patiente, elle est pleine de bonté; la charité n'est point envieuse; la charité ne se vante point, elle ne s'enfle point d'orgueil.", 'Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up.'),
  ga6_9: v('Galates 6:9', 'Galatians 6:9', 'Ne nous lassons pas de faire le bien; car nous moissonnerons au temps convenable, si nous ne nous relâchons pas.', 'And let us not be weary in well doing: for in due season we shall reap, if we faint not.'),
  rm12_21: v('Romains 12:21', 'Romans 12:21', 'Ne te laisse pas vaincre par le mal, mais surmonte le mal par le bien.', 'Be not overcome of evil, but overcome evil with good.'),
  mt25_35: v('Matthieu 25:35', 'Matthew 25:35', "Car j'ai eu faim, et vous m'avez donné à manger; j'ai eu soif, et vous m'avez donné à boire; j'étais étranger, et vous m'avez recueilli.", 'For I was an hungred, and ye gave me meat: I was thirsty, and ye gave me drink: I was a stranger, and ye took me in.'),
  ph4_6: v('Philippiens 4:6', 'Philippians 4:6', 'Ne vous inquiétez de rien; mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications, avec des actions de grâces.', 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.'),
  jc1_27: v('Jacques 1:27', 'James 1:27', 'La religion pure et sans tache, devant Dieu notre Père, consiste à visiter les orphelins et les veuves dans leurs afflictions, et à se préserver des souillures du monde.', 'Pure religion and undefiled before God and the Father is this, To visit the fatherless and widows in their affliction, and to keep himself unspotted from the world.'),
  // versets des parchemins cachés dans les villes
  ph4_13: v('Philippiens 4:13', 'Philippians 4:13', 'Je puis tout par celui qui me fortifie.', 'I can do all things through Christ which strengtheneth me.'),
  ps23_1: v('Psaume 23:1', 'Psalm 23:1', "L'Éternel est mon berger: je ne manquerai de rien.", 'The LORD is my shepherd; I shall not want.'),
  pr3_5: v('Proverbes 3:5', 'Proverbs 3:5', "Confie-toi en l'Éternel de tout ton cœur, Et ne t'appuie pas sur ta sagesse.", 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.'),
  jos1_9: v('Josué 1:9', 'Joshua 1:9', "Fortifie-toi et prends courage. Ne t'effraie point et ne t'épouvante point, car l'Éternel, ton Dieu, est avec toi dans tout ce que tu entreprendras.", 'Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.'),
  rm8_28: v('Romains 8:28', 'Romans 8:28', 'Nous savons, du reste, que toutes choses concourent au bien de ceux qui aiment Dieu, de ceux qui sont appelés selon son dessein.', 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.'),
  mt6_33: v('Matthieu 6:33', 'Matthew 6:33', 'Cherchez premièrement le royaume et la justice de Dieu; et toutes ces choses vous seront données par-dessus.', 'But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.'),
  mt11_28: v('Matthieu 11:28', 'Matthew 11:28', 'Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.', 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.'),
  jn1_9: v('1 Jean 1:9', '1 John 1:9', 'Si nous confessons nos péchés, il est fidèle et juste pour nous les pardonner, et pour nous purifier de toute iniquité.', 'If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness.'),
  ep2_8: v('Éphésiens 2:8', 'Ephesians 2:8', "Car c'est par la grâce que vous êtes sauvés, par le moyen de la foi. Et cela ne vient pas de vous, c'est le don de Dieu.", 'For by grace are ye saved through faith; and that not of yourselves: it is the gift of God.'),
  mt5_16: v('Matthieu 5:16', 'Matthew 5:16', "Que votre lumière luise ainsi devant les hommes, afin qu'ils voient vos bonnes œuvres, et qu'ils glorifient votre Père qui est dans les cieux.", 'Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.'),
  jc4_7: v('Jacques 4:7', 'James 4:7', 'Soumettez-vous donc à Dieu; résistez au diable, et il fuira loin de vous.', 'Submit yourselves therefore to God. Resist the devil, and he will flee from you.'),
  jn15_5: v('Jean 15:5', 'John 15:5', 'Je suis le cep, vous êtes les sarments. Celui qui demeure en moi et en qui je demeure porte beaucoup de fruit, car sans moi vous ne pouvez rien faire.', 'I am the vine, ye are the branches: He that abideth in me, and I in him, the same bringeth forth much fruit: for without me ye can do nothing.'),
  ps133_1: v('Psaume 133:1', 'Psalm 133:1', "Voici, oh! qu'il est agréable, qu'il est doux Pour des frères de demeurer ensemble!", 'Behold, how good and how pleasant it is for brethren to dwell together in unity!'),
  th5_17: v('1 Thessaloniciens 5:17', '1 Thessalonians 5:17', 'Priez sans cesse.', 'Pray without ceasing.'),
};
export const SCROLLS = ['ph4_13', 'ps23_1', 'pr3_5', 'jos1_9', 'rm8_28', 'mt6_33', 'mt11_28', 'jn1_9', 'ep2_8', 'mt5_16', 'jc4_7', 'jn15_5', 'ps133_1', 'th5_17'];

export const GRADES = [
  { icon: '🔍', name: ['Chercheur', 'Seeker'], desc: ['Tu cherches la vérité.', 'You are seeking the truth.'], badge: ['', ''] },
  { icon: '🕊️', name: ['Nouveau-né en Christ', 'Born Again'], desc: ['Tu as reçu Jésus : tu es une nouvelle créature. Le ciel est en fête !', 'You have received Jesus: you are a new creature. Heaven rejoices!'], badge: ['La Robe Blanche', 'The White Robe'] },
  { icon: '📖', name: ['Disciple', 'Disciple'], desc: ['Tu pries, tu lis la Parole et tu marches avec tes frères. Tes racines s’enfoncent.', 'You pray, read the Word and walk with the brethren. Your roots grow deep.'], badge: ['La Lampe de la Parole', 'The Lamp of the Word'] },
  { icon: '🤲', name: ['Serviteur', 'Servant'], desc: ['Comme Jésus, tu sers, tu donnes et tu pardonnes.', 'Like Jesus, you serve, give and forgive.'], badge: ['Le Linge du Serviteur', "The Servant's Towel"] },
  { icon: '🔥', name: ['Témoin', 'Witness'], desc: ["Tu n'as pas honte de l'Évangile. Tu partages ta foi avec douceur.", 'You are not ashamed of the gospel. You share your faith with meekness.'], badge: ['Le Flambeau du Témoin', "The Witness's Torch"] },
  { icon: '🛡️', name: ['Soldat de Christ', 'Soldier of Christ'], desc: ['Tu tiens ferme dans la tentation, revêtu des armes de Dieu.', 'You stand firm in temptation, clothed with the armour of God.'], badge: ["L'Armure de Dieu", 'The Armour of God'] },
  { icon: '🐑', name: ['Faiseur de disciples', 'Disciple-Maker'], desc: ["Tu prends soin des autres et tu transmets ce que tu as reçu.", 'You care for others and pass on what you have received.'], badge: ['Le Bâton du Berger', "The Shepherd's Staff"] },
  { icon: '👑', name: ['Ambassadeur de Christ', 'Ambassador of Christ'], desc: ["Chrétien mûr, tu portes du fruit et tu es envoyé vers les nations. « C'est bien, bon et fidèle serviteur. »", 'A mature Christian, you bear fruit and are sent to the nations. "Well done, good and faithful servant."'], badge: ['La Couronne de Vie', 'The Crown of Life'] },
];

const q = (qq, o, a = 0, why) => ({ q: qq, o, a, why });
const PASTOR = { lome: ['Pasteur Élie', 'Pastor Elijah'], cotonou: ['Pasteur Dossou', 'Pastor Dossou'], accra: ['Pasteur Kwame', 'Pastor Kwame'], abidjan: ['Pasteur Koné', 'Pastor Koné'], lagos: ['Pasteur Ade', 'Pastor Ade'], paris: ['Pasteur Samuel', 'Pastor Samuel'], london: ['Pasteur Daniel', 'Pastor Daniel'] };
const ME = 'me';

// ============ LA MARCHE CHRÉTIENNE ============
const WALK = [
  { id: 'w1a', grade: 1, city: 'lome', at: 'landmark', title: ['La rencontre', 'The encounter'], giver: 'mensah', gname: PASTOR.lome, verse: 'jn3_16', reward: { faith: 20, wisdom: 5 },
    lesson: ['Le salut est un don : on le reçoit par la foi en Jésus, pas par ses mérites.', 'Salvation is a gift: we receive it by faith in Jesus, not by our merits.'],
    async run(m) {
      const p = m.giver;
      await m.talk([[p, ['Bonjour ! Je suis le pasteur Élie. Puis-je te poser une question importante ?', 'Hello! I am Pastor Elijah. May I ask you an important question?']],
        [ME, ['Bien sûr, pasteur.', 'Of course, pastor.']],
        [p, ["Si ta vie s'arrêtait aujourd'hui, sais-tu où tu passerais l'éternité ?", 'If your life ended today, do you know where you would spend eternity?']],
        [ME, ["Honnêtement… je ne sais pas. J'essaie d'être quelqu'un de bien.", 'Honestly… I do not know. I try to be a good person.']],
        [p, ["Personne n'est assez bon pour mériter le ciel : tous ont péché. Mais Dieu t'aime tellement qu'il a envoyé Jésus mourir à ta place, et il est ressuscité.", 'No one is good enough to earn heaven: all have sinned. But God loves you so much that he sent Jesus to die in your place, and he rose again.']]]);
      await m.read('jn3_16');
      await m.choice(p, ['Veux-tu recevoir Jésus comme ton Sauveur et Seigneur ?', 'Will you receive Jesus as your Saviour and Lord?'], [
        { t: ['Oui. Je veux lui donner ma vie.', 'Yes. I want to give him my life.'], ok: 1, r: ["Gloire à Dieu ! Prions ensemble, de tout ton cœur.", 'Glory to God! Let us pray together, with all your heart.'] },
        { t: ["Je dois d'abord devenir meilleur.", 'I must first become better.'], r: ["On ne se lave pas avant d'aller à la douche ! Viens à Jésus tel que tu es : c'est lui qui change le cœur.", 'You do not wash before taking a shower! Come to Jesus as you are: he is the one who changes the heart.'] },
        { t: ['Plus tard, peut-être…', 'Later, maybe…'], r: ["« Voici maintenant le jour du salut. » Demain ne nous appartient pas. Qu'est-ce qui te retient ?", '"Now is the day of salvation." Tomorrow is not ours. What is holding you back?'] }]);
      await m.pray(['Seigneur Jésus,', 'je reconnais que je suis pécheur et que j’ai besoin de toi.', 'Je crois que tu es mort pour mes péchés', 'et que Dieu t’a ressuscité des morts.', 'Pardonne-moi. Entre dans ma vie.', 'Je te reçois comme mon Sauveur et mon Seigneur.', 'Merci de faire de moi un enfant de Dieu.'],
        ['Lord Jesus,', 'I admit that I am a sinner and that I need you.', 'I believe that you died for my sins', 'and that God raised you from the dead.', 'Forgive me. Come into my life.', 'I receive you as my Saviour and my Lord.', 'Thank you for making me a child of God.'], ['La prière du salut', 'The prayer of salvation']);
      await m.say(p, ["Bienvenue dans la famille de Dieu ! Les anges se réjouissent en ce moment même. Retrouve-moi à l'église : j'ai quelque chose pour toi.", 'Welcome to the family of God! The angels are rejoicing right now. Meet me at the church: I have something for you.']);
    } },
  { id: 'w1b', grade: 1, city: 'lome', at: 'church', title: ['Une vie nouvelle', 'A new life'], giver: 'mensah', gname: PASTOR.lome, verse: 'co5_17', reward: { faith: 10, wisdom: 15 },
    lesson: ["Ton salut repose sur la promesse de Dieu, pas sur tes émotions. Tu es une nouvelle créature.", "Your salvation rests on God's promise, not on your feelings. You are a new creature."],
    async run(m) {
      const p = m.giver;
      await m.say(p, ['Voici ta première Bible. C’est la Parole de Dieu : ta nourriture de chaque jour. Va la prendre sur l’estrade.', 'Here is your first Bible. It is the Word of God: your daily food. Go and take it from the platform.']);
      await m.collect(1, 'altar', ['Prends ta Bible près du pupitre', 'Take your Bible near the pulpit'], { spread: 1.5, label: ['Bible', 'Bible'] });
      await m.read('co5_17', m.t(['Ouvre-la. Lis à voix haute :', 'Open it. Read aloud:']));
      await m.say(p, ['Parfois tu douteras. Alors souviens-toi de ce que Dieu a dit, pas de ce que tu ressens. Voyons si tu as compris.', 'Sometimes you will doubt. Then remember what God has said, not what you feel. Let us see if you understood.']);
      await m.quiz([
        q(['Sur quoi repose ton salut ?', 'What does your salvation rest on?'], [['Sur la grâce de Dieu, reçue par la foi en Jésus', "On God's grace, received through faith in Jesus"], ['Sur mes bonnes actions', 'On my good deeds'], ['Sur mes émotions du moment', 'On my feelings of the moment']], 0, ['(Éphésiens 2:8)', '(Ephesians 2:8)']),
        q(['Que faire quand tu tombes dans le péché ?', 'What should you do when you fall into sin?'], [['Le confesser à Dieu : il est fidèle pour pardonner', 'Confess it to God: he is faithful to forgive'], ['Me cacher et abandonner', 'Hide and give up'], ['Faire comme si de rien n’était', 'Pretend nothing happened']], 0, ['(1 Jean 1:9)', '(1 John 1:9)']),
        q(['Que dit 2 Corinthiens 5:17 de toi ?', 'What does 2 Corinthians 5:17 say about you?'], [['Je suis une nouvelle créature en Christ', 'I am a new creature in Christ'], ['Je dois encore mériter ma place', 'I must still earn my place'], ['Rien n’a changé', 'Nothing has changed']], 0)]);
      await m.memorize('co5_17');
    } },
  { id: 'w1c', grade: 1, city: 'lome', at: 'church', title: ['Le baptême', 'Baptism'], giver: 'mensah', gname: PASTOR.lome, verse: 'ac2_38', reward: { faith: 25, love: 5 },
    lesson: ["Le baptême est un acte d'obéissance : tu déclares publiquement que tu appartiens à Jésus.", 'Baptism is an act of obedience: you publicly declare that you belong to Jesus.'],
    async run(m) {
      const p = m.giver;
      await m.talk([[p, ["Jésus a demandé à ses disciples d'être baptisés. Ce n'est pas l'eau qui sauve : c'est le signe visible de ce que Dieu a fait dans ton cœur.", 'Jesus asked his disciples to be baptised. Water does not save: it is the visible sign of what God has done in your heart.']],
        [p, ["Plongé dans l'eau : ta vieille vie est ensevelie. Relevé de l'eau : tu marches en nouveauté de vie. Es-tu prêt ?", 'Lowered into the water: your old life is buried. Raised from the water: you walk in newness of life. Are you ready?']],
        [ME, ['Oui, je veux obéir au Seigneur.', 'Yes, I want to obey the Lord.']],
        [p, ['Alors rejoins-moi à la plage. Les frères et sœurs nous y attendent !', 'Then join me at the beach. The brothers and sisters are waiting for us there!']]]);
      const p2 = await m.npc('mensah', 'beach', PASTOR.lome, { dz: 14 });
      const a = await m.npc('ama', 'beach', ['Sœur Afi', 'Sister Afi'], { dx: -3, dz: 10, anim: 'claphands_01' });
      const b = await m.npc('kodjo', 'beach', ['Frère Kodjo', 'Brother Kodjo'], { dx: 3, dz: 10, anim: 'claphands_01' });
      await m.meet(p2, ["Va à la plage et rejoins le pasteur au bord de l'eau", 'Go to the beach and join the pastor at the water’s edge']);
      await m.say(p2, [`${m.P}, crois-tu que Jésus-Christ est le Fils de Dieu, mort et ressuscité pour toi ?`, `${m.P}, do you believe that Jesus Christ is the Son of God, who died and rose again for you?`]);
      await m.say(ME, ['Oui, je le crois de tout mon cœur !', 'Yes, I believe it with all my heart!']);
      m.anim('player', 'crouch_idle'); await m.say(p2, ['Sur la confession de ta foi, je te baptise au nom du Père, du Fils et du Saint-Esprit.', 'Upon the confession of your faith, I baptise you in the name of the Father, and of the Son, and of the Holy Ghost.']);
      await m.wait(1.5); m.anim('player', 'cheer_01'); m.anim(p2, 'claphands_01');
      await m.say(a, ['Alléluia ! Bienvenue, notre frère, notre sœur en Christ !', 'Hallelujah! Welcome, our brother, our sister in Christ!']);
      await m.wait(2); m.anim('player', null);
    } },
  // ---- Grade 2 : Disciple ----
  { id: 'w2a', grade: 2, city: 'lome', at: 'home', title: ['Le lieu secret', 'The secret place'], verse: 'mt6_6', reward: { faith: 20, wisdom: 5 },
    lesson: ['La prière, c’est parler à ton Père. Commence chaque journée avec lui : adoration, confession, reconnaissance, demandes.', 'Prayer is talking to your Father. Begin every day with him: adoration, confession, thanksgiving, requests.'],
    async run(m) {
      await m.say(ME, ['Le pasteur m’a dit : « Un chrétien qui ne prie pas est comme un téléphone jamais rechargé. » Commençons la journée avec Dieu.', 'The pastor told me: "A Christian who does not pray is like a phone that is never charged." Let us begin the day with God.']);
      await m.read('mt6_6');
      await m.ask(q(['Par quoi est-il bon de commencer sa prière ?', 'What is a good way to begin your prayer?'], [['Adorer Dieu et le remercier', 'Worship God and thank him'], ['Réciter vite ma liste de demandes', 'Quickly recite my list of requests'], ['Me plaindre de mes voisins', 'Complain about my neighbours']], 0, ['« Notre Père qui es aux cieux ! Que ton nom soit sanctifié. »', '"Our Father which art in heaven, Hallowed be thy name."']));
      await m.pray(['Père céleste, je t’adore : tu es saint et bon.', 'Merci pour cette nouvelle journée et pour ton salut.', 'Pardonne-moi là où j’ai manqué.', 'Donne-moi aujourd’hui le pain dont j’ai besoin.', 'Conduis mes pas et garde-moi du mal.', 'Fais de moi une lumière dans cette ville.', 'Au nom de Jésus.'],
        ['Heavenly Father, I worship you: you are holy and good.', 'Thank you for this new day and for your salvation.', 'Forgive me where I have failed.', 'Give me today the bread I need.', 'Guide my steps and keep me from evil.', 'Make me a light in this city.', 'In the name of Jesus.'], ['La prière du matin', 'Morning prayer']);
      await m.memorize('mt6_6');
    } },
  { id: 'w2b', grade: 2, city: 'lome', at: 'park', title: ['La Parole chaque jour', 'The Word every day'], giver: 'akou', gname: ['Sœur Akou', 'Sister Akou'], verse: 'ps119_105', reward: { wisdom: 25, faith: 5 },
    lesson: ['La Bible est ta lampe. Lis-la chaque jour, médite-la et mets-la en pratique.', 'The Bible is your lamp. Read it every day, meditate on it and put it into practice.'],
    async run(m) {
      const s = m.giver;
      await m.say(s, ['Bonjour ! Je suis sœur Akou, responsable de l’école du dimanche. Oh non… le vent a dispersé mes fiches de versets dans le jardin ! Peux-tu m’aider ?', 'Hello! I am Sister Akou, the Sunday school leader. Oh no… the wind has scattered my verse cards across the garden! Can you help me?']);
      await m.collect(6, 'park', ['Ramasse les 6 fiches de versets dans le jardin', 'Pick up the 6 verse cards in the garden'], { spread: 22, dz: -28, label: ['Fiche', 'Card'] });
      await m.say(s, ['Merci ! Puisque tu les as toutes en main, voyons ce que tu connais de la Bible.', 'Thank you! Since you have them all in hand, let us see what you know about the Bible.']);
      await m.quiz([
        q(['Combien de livres compte la Bible ?', 'How many books are in the Bible?'], [['66', '66'], ['27', '27'], ['100', '100']], 0, ['39 dans l’Ancien Testament et 27 dans le Nouveau.', '39 in the Old Testament and 27 in the New.']),
        q(['Quel est le premier livre de la Bible ?', 'What is the first book of the Bible?'], [['La Genèse', 'Genesis'], ['Matthieu', 'Matthew'], ['Les Psaumes', 'Psalms']], 0),
        q(['Quels livres racontent la vie de Jésus ?', 'Which books tell the life of Jesus?'], [['Matthieu, Marc, Luc et Jean', 'Matthew, Mark, Luke and John'], ['Genèse et Exode', 'Genesis and Exodus'], ['Romains et Galates', 'Romans and Galatians']], 0, ['On les appelle les Évangiles.', 'They are called the Gospels.']),
        q(['À quoi le Psaume 119 compare-t-il la Parole ?', 'What does Psalm 119 compare the Word to?'], [['Une lampe à mes pieds', 'A lamp unto my feet'], ['Un trésor caché sous la mer', 'A treasure hidden under the sea'], ['Une épée rouillée', 'A rusty sword']], 0)]);
      await m.memorize('ps119_105');
      await m.say(s, ['Un conseil : commence par l’Évangile de Jean, un chapitre par jour. Et avant de lire, demande au Saint-Esprit de t’éclairer.', 'A tip: start with the Gospel of John, one chapter a day. And before reading, ask the Holy Spirit to enlighten you.']);
    } },
  { id: 'w2c', grade: 2, city: 'lome', at: 'church', title: ['La famille de Dieu', 'The family of God'], giver: 'mensah', gname: PASTOR.lome, verse: 'he10_25', reward: { love: 20, faith: 10 },
    lesson: ['Un charbon isolé s’éteint. Reste attaché à une église locale : on y adore, on y apprend, on s’y encourage.', 'A lone coal goes out. Stay attached to a local church: there we worship, learn and encourage one another.'],
    async run(m) {
      const p = m.giver;
      await m.say(p, ['C’est dimanche ! Le culte commence. Viens louer le Seigneur avec nous, puis va saluer trois frères et sœurs.', 'It is Sunday! The service is starting. Come and praise the Lord with us, then go and greet three brothers and sisters.']);
      const n = [await m.npc('ama', 'altar', ['Sœur Afi', 'Sister Afi'], { dx: -5, dz: 5, anim: 'claphands_01' }), await m.npc('kodjo', 'altar', ['Frère Kodjo', 'Brother Kodjo'], { dx: 5, dz: 7, anim: 'dancing_neutral' }), await m.npc('esi', 'altar', ['Maman Esi', 'Mama Esi'], { dx: -4, dz: 11, anim: 'claphands_01' })];
      await m.goto('altar', ['Entre dans le temple et avance vers l’estrade', 'Enter the temple and walk towards the platform'], { r: 4.5, dz: 4 });
      await m.worship();
      const words = [[['Sois le bienvenu ! Ici, personne n’est étranger.', 'Welcome! Here, no one is a stranger.']], [['Si tu as besoin de quoi que ce soit, frappe à ma porte.', 'If you need anything, knock on my door.']], [['Mon enfant, je prierai pour toi chaque jour.', 'My child, I will pray for you every day.']]];
      for (let i = 0; i < 3; i++) { await m.meet(n[i], ['Salue les frères et sœurs', 'Greet the brothers and sisters'] ); await m.say(n[i], words[i][0]); m.anim(n[i], 'idle_neutral_01'); }
      await m.read('he10_25');
    } },
  // ---- Grade 3 : Serviteur (Cotonou) ----
  { id: 'w3a', grade: 3, city: 'cotonou', at: 'church', title: ['Servir comme Jésus', 'Serving like Jesus'], giver: 'mensah', gname: PASTOR.cotonou, verse: 'mc10_45', reward: { love: 20, faith: 5 },
    lesson: ['Dans le Royaume, le plus grand est celui qui sert. Aucune tâche n’est trop petite quand elle est faite pour Jésus.', 'In the Kingdom, the greatest is the one who serves. No task is too small when it is done for Jesus.'],
    async run(m) {
      const p = m.giver;
      await m.talk([[p, ['Bienvenue à Cotonou ! Le pasteur Élie m’a parlé de toi. Ici, on apprend une chose : Jésus, le Roi des rois, a lavé les pieds de ses disciples.', 'Welcome to Cotonou! Pastor Elijah told me about you. Here we learn one thing: Jesus, the King of kings, washed his disciples’ feet.']],
        [p, ['Après la fête d’hier, la cour de l’église est pleine de déchets. Personne ne verra qui a nettoyé… sauf Dieu.', 'After yesterday’s celebration, the church yard is full of rubbish. No one will see who cleaned up… except God.']]]);
      await m.choice(p, ['Que réponds-tu ?', 'What do you answer?'], [
        { t: ['Je m’en occupe avec joie.', 'I will gladly take care of it.'], ok: 1, r: ['Voilà le cœur d’un serviteur !', 'That is the heart of a servant!'] },
        { t: ['Ce n’est pas un travail pour moi.', 'That is not a job for me.'], r: ['Jésus a pris un linge et une bassine. Sommes-nous plus grands que notre Maître ?', 'Jesus took a towel and a basin. Are we greater than our Master?'] },
        { t: ['Seulement si on m’applaudit dimanche.', 'Only if I get applauded on Sunday.'], r: ['Celui qui sert pour être vu a déjà reçu sa récompense. Sers pour Dieu.', 'He who serves to be seen has already had his reward. Serve for God.'] }]);
      await m.collect(7, 'church', ['Ramasse les 7 déchets autour de l’église', 'Pick up the 7 pieces of rubbish around the church'], { spread: 24, dz: -6, label: ['Déchet', 'Rubbish'], color: 0x8a7a5a });
      await m.say(p, ['Merci. Tu as servi sans te plaindre. C’est ainsi que Dieu forme ses ouvriers.', 'Thank you. You served without complaining. This is how God trains his workers.']);
      await m.read('mc10_45');
    } },
  { id: 'w3b', grade: 3, city: 'cotonou', at: 'market', title: ['Donner avec joie', 'Giving cheerfully'], giver: 'esi', gname: ['Maman Rose', 'Mama Rose'], verse: 'co9_7', reward: { love: 25, talents: 20 },
    lesson: ['Tout ce que tu as vient de Dieu. Donner, c’est lui faire confiance et aimer concrètement.', 'All you have comes from God. To give is to trust him and to love in practice.'],
    async run(m) {
      const s = m.giver;
      await m.say(s, ['Mon enfant, l’église prépare des paniers pour trois veuves du quartier, mais il manque de quoi les remplir…', 'My child, the church is preparing baskets for three widows of the neighbourhood, but we lack what is needed to fill them…']);
      await m.choice(s, ['Tu as un peu d’argent mis de côté. Que fais-tu ?', 'You have a little money set aside. What do you do?'], [
        { t: ['Je donne de bon cœur ce que j’ai décidé devant Dieu.', 'I gladly give what I have decided before God.'], ok: 1, r: ['Dieu aime celui qui donne avec joie !', 'God loves a cheerful giver!'] },
        { t: ['Je donne, mais en grognant.', 'I give, but grudgingly.'], r: ['« Sans tristesse ni contrainte », dit la Parole. Le cœur compte plus que le montant.', '"Not grudgingly, or of necessity," says the Word. The heart matters more than the amount.'] },
        { t: ['Je garde tout : on ne sait jamais.', 'I keep it all: you never know.'], r: ['Celui qui sème peu moissonnera peu. Ton Père sait de quoi tu as besoin.', 'He who sows sparingly shall reap sparingly. Your Father knows what you need.'] }]);
      await m.collect(3, 'market', ['Remplis 3 paniers aux étals du marché', 'Fill 3 baskets at the market stalls'], { spread: 20, dz: -26, label: ['Panier', 'Basket'], color: 0xd98a2b });
      const w = [await m.npc('akou', 'orphanage', ['Veuve Adjoa', 'Widow Adjoa'], { dx: -6 }), await m.npc('ama', 'school', ['Veuve Clarisse', 'Widow Clarisse'], { dx: 5 }), await m.npc('esi', 'hospital', ['Veuve Thérèse', 'Widow Theresa'], { dx: -5 })];
      const th = [['Que Dieu te le rende au centuple !', 'May God repay you a hundredfold!'], ['Je n’avais plus rien pour ce soir… Dieu a entendu ma prière.', 'I had nothing left for tonight… God heard my prayer.'], ['Tu es la réponse à ma prière de ce matin.', 'You are the answer to my prayer this morning.']];
      for (let i = 0; i < 3; i++) { await m.meet(w[i], ['Apporte un panier à chaque veuve', 'Take a basket to each widow'], ['Donner', 'Give']); await m.say(w[i], th[i]); m.anim(w[i], 'wave_01'); }
    } },
  { id: 'w3c', grade: 3, city: 'cotonou', at: 'park', title: ['Pardonner', 'Forgiving'], giver: 'kodjo', gname: ['Frère Koffi', 'Brother Koffi'], verse: 'ep4_32', reward: { love: 20, faith: 15 },
    lesson: ['Pardonner n’est pas dire que le mal était bien : c’est remettre la dette à Dieu, comme lui t’a pardonné.', 'To forgive is not to say that wrong was right: it is to hand the debt over to God, as he has forgiven you.'],
    async run(m) {
      const k = m.giver;
      await m.talk([[ME, ['(C’est Koffi… Il m’a emprunté de l’argent, il a menti à mon sujet, et il ne m’a jamais remboursé.)', '(It is Koffi… He borrowed money from me, lied about me, and never paid me back.)']],
        [k, ['… Je savais qu’on finirait par se croiser. J’ai honte. J’ai mal agi envers toi. Je n’ai toujours pas de quoi te rembourser.', '… I knew we would meet eventually. I am ashamed. I wronged you. I still cannot pay you back.']]]);
      await m.choice(ME, ['Que fais-tu ?', 'What do you do?'], [
        { t: ['« Je te pardonne, Koffi. Dieu m’a pardonné bien plus. »', '"I forgive you, Koffi. God has forgiven me far more."'], ok: 1, r: ['Tu… tu me pardonnes ? Après tout ça ? Je ne comprends pas un tel amour.', 'You… you forgive me? After all that? I do not understand such love.'] },
        { t: ['Je l’humilie devant tout le monde.', 'I humiliate him in front of everyone.'], r: ['(Le serviteur à qui le roi avait remis dix mille talents a étranglé son compagnon pour cent deniers… Suis-je en train de faire pareil ?)', '(The servant forgiven ten thousand talents seized his fellow by the throat for a hundred pence… Am I doing the same?)'] },
        { t: ['Je l’ignore et je garde ma rancune.', 'I ignore him and keep my grudge.'], r: ['(La rancune est un poison que l’on boit en espérant que l’autre en souffre. « Si vous pardonnez… votre Père vous pardonnera aussi. »)', '(A grudge is a poison we drink hoping the other will suffer. "If ye forgive… your heavenly Father will also forgive you.")'] }]);
      await m.say(ME, ['C’est Jésus qui me l’a appris. Viens à l’église dimanche, tu comprendras.', 'Jesus taught me this. Come to church on Sunday and you will understand.']);
      await m.pray(['Père, merci de m’avoir tout pardonné à la croix.', 'Je choisis de pardonner à Koffi.', 'Je te remets sa dette et ma blessure.', 'Bénis-le et attire-le à toi.', 'Garde mon cœur de toute amertume.'], ['Father, thank you for forgiving me everything at the cross.', 'I choose to forgive Koffi.', 'I hand over to you his debt and my wound.', 'Bless him and draw him to yourself.', 'Keep my heart from all bitterness.']);
      await m.memorize('ep4_32');
    } },
  // ---- Grade 4 : Témoin (Accra) ----
  { id: 'w4a', grade: 4, city: 'accra', at: 'church', title: ['Mon témoignage', 'My testimony'], giver: 'mensah', gname: PASTOR.accra, verse: 'p3_15', reward: { wisdom: 15, faith: 15 },
    lesson: ['Ton témoignage tient en trois temps : ma vie avant, ma rencontre avec Jésus, ma vie depuis. Personne ne peut le contredire.', 'Your testimony has three parts: my life before, how I met Jesus, my life since. No one can argue with it.'],
    async run(m) {
      const p = m.giver;
      await m.say(p, ['Akwaaba, bienvenue à Accra ! Tu grandis. Il est temps d’apprendre à dire ce que Jésus a fait pour toi. Un bon témoignage est simple et vrai.', 'Akwaaba, welcome to Accra! You are growing. It is time to learn to tell what Jesus has done for you. A good testimony is simple and true.']);
      await m.quiz([
        q(['Par quoi commencer ton témoignage ?', 'How should your testimony begin?'], [['Ma vie avant de connaître Jésus', 'My life before I knew Jesus'], ['Les défauts des autres religions', 'The faults of other religions'], ['Une longue prédication', 'A long sermon']], 0),
        q(['Quel est le cœur du témoignage ?', 'What is the heart of the testimony?'], [['Comment j’ai rencontré Jésus et cru en lui', 'How I met Jesus and believed in him'], ['Combien je suis devenu parfait', 'How perfect I have become'], ['Les règles de mon église', 'The rules of my church']], 0),
        q(['Comment le terminer ?', 'How should it end?'], [['Ce que Jésus a changé dans ma vie depuis', 'What Jesus has changed in my life since'], ['En forçant la personne à décider', 'By forcing the person to decide'], ['En me moquant de ses doutes', 'By mocking their doubts']], 0, ['« Avec douceur et respect. »', '"With meekness and fear."'])]);
      const f = await m.npc('jeune', 'stadium', ['Kwesi', 'Kwesi'], { dx: 4 });
      await m.meet(f, ['Va raconter ton témoignage à Kwesi, au terrain des jeunes', 'Go and tell your testimony to Kwesi, at the youth pitch']);
      await m.talk([[f, ['Hé ! On dit que tu as changé. C’est quoi, cette histoire de Jésus ?', 'Hey! People say you have changed. What is this Jesus story about?']],
        [ME, ['Avant, je vivais sans but, avec un vide que rien ne remplissait. Un jour, on m’a expliqué que Jésus était mort pour moi. Je lui ai donné ma vie.', 'Before, I lived without purpose, with an emptiness nothing could fill. One day someone explained that Jesus died for me. I gave him my life.']],
        [ME, ['Depuis, j’ai la paix, je suis pardonné, et je sais où je vais. Il peut faire la même chose pour toi.', 'Since then I have peace, I am forgiven, and I know where I am going. He can do the same for you.']],
        [f, ['… Personne ne m’avait parlé comme ça. Tu me prêtes ta Bible ? Je veux lire par moi-même.', '… No one ever spoke to me like that. Will you lend me your Bible? I want to read for myself.']]]);
      await m.read('p3_15');
    } },
  { id: 'w4b', grade: 4, city: 'accra', at: 'market', title: ['Semer la Parole', 'Sowing the Word'], giver: 'ama', gname: ['Sœur Abena', 'Sister Abena'], verse: 'rm1_16', reward: { faith: 20, love: 10 },
    lesson: ['Ton rôle est de semer avec amour. C’est Dieu qui fait croître. Ne te décourage pas devant un refus.', 'Your part is to sow with love. It is God who gives the growth. Do not be discouraged by a refusal.'],
    async run(m) {
      const s = m.giver;
      await m.say(s, ['Aujourd’hui, notre groupe partage l’Évangile au marché. Voici cinq traités. Souris, sois poli, et n’oblige personne.', 'Today our group is sharing the gospel at the market. Here are five tracts. Smile, be polite, and force no one.']);
      const ppl = [['ouvrier', ['Un maçon', 'A bricklayer'], ['Jésus ? J’ai trop de soucis pour penser à ça… Bon, donne quand même. Je lirai à la pause.', 'Jesus? I have too many worries to think about that… All right, give it anyway. I will read it at break time.']],
        ['esi', ['Une vendeuse', 'A market woman'], ['Oh, merci ! Ma mère priait pour moi. Peut-être que Dieu me rappelle à lui…', 'Oh, thank you! My mother used to pray for me. Perhaps God is calling me back…']],
        ['edem', ['Un étudiant', 'A student'], ['Non merci, ça ne m’intéresse pas.', 'No thanks, I am not interested.']],
        ['sportif', ['Un footballeur', 'A footballer'], ['Tu crois vraiment à ça ? … Tu as l’air en paix, en tout cas. Je le prends.', 'Do you really believe that? … You do look at peace, anyway. I will take it.']],
        ['akou', ['Une infirmière', 'A nurse'], ['Je vois des gens mourir chaque semaine. J’ai besoin d’espérance. Merci, vraiment.', 'I see people die every week. I need hope. Thank you, truly.']]];
      const ns = []; for (let i = 0; i < 5; i++) ns.push(await m.npc(ppl[i][0], 'market', ppl[i][1], { dx: -22 + i * 11, dz: -8 - (i % 2) * 22, anim: 'idle_look_around_01' }));
      for (let i = 0; i < 5; i++) { await m.meet(ns, ['Offre un traité à 5 personnes du marché', 'Offer a tract to 5 people in the market'], ['Offrir un traité', 'Offer a tract']); const k = ns.indexOf(m.last); await m.say(ME, ['Bonjour ! Puis-je vous offrir ceci ? C’est une bonne nouvelle.', 'Hello! May I offer you this? It is good news.']); await m.say(ns[k], ppl[k][2]); if (k === 2) await m.say(ME, ['(Un refus… Ce n’est pas grave. Je prie pour lui et je continue.)', '(A refusal… That is all right. I pray for him and carry on.)']); ns[k].met = true; }
      await m.say(s, ['Quatre graines semées, et une prière pour le cinquième. Bien joué !', 'Four seeds sown, and a prayer for the fifth. Well done!']);
      await m.memorize('rm1_16');
    } },
  { id: 'w4c', grade: 4, city: 'accra', at: 'school', title: ['Répondre avec douceur', 'Answering with meekness'], giver: 'edem', gname: ['Kojo, étudiant', 'Kojo, a student'], verse: 'jn14_6', reward: { wisdom: 25, love: 5 },
    lesson: ['On ne gagne pas les cœurs en gagnant des disputes. Réponds avec la vérité, mais toujours avec amour.', 'We do not win hearts by winning arguments. Answer with truth, but always with love.'],
    async run(m) {
      const k = m.giver;
      await m.say(k, ['Alors c’est toi qui distribues des papiers sur Jésus ? J’ai des questions, et je parie que tu n’as pas de réponses.', 'So you are the one handing out papers about Jesus? I have questions, and I bet you have no answers.']);
      await m.choice(k, ['« Toutes les religions mènent à Dieu, non ? »', '"All religions lead to God, don’t they?"'], [
        { t: ['« Jésus a dit : Je suis le chemin, la vérité et la vie. Je te le dis avec respect : c’est lui que je te propose de découvrir. »', '"Jesus said: I am the way, the truth, and the life. I say it with respect: he is the one I invite you to discover."'], ok: 1, r: ['Hmm. Au moins tu sais ce que tu crois.', 'Hmm. At least you know what you believe.'] },
        { t: ['« Tu es ignorant, tu iras en enfer ! »', '"You are ignorant, you will go to hell!"'], r: ['Tu vois ? Vous êtes tous pareils : arrogants.', 'See? You are all the same: arrogant.'] },
        { t: ['« Oui, sûrement, peu importe. »', '"Yes, probably, whatever."'], r: ['Ah. Donc ta foi ne change rien, finalement ?', 'Ah. So your faith changes nothing, in the end?'] }]);
      await m.choice(k, ['« Si Dieu est bon, pourquoi y a-t-il tant de souffrance ? »', '"If God is good, why is there so much suffering?"'], [
        { t: ['« Je n’ai pas toutes les réponses. Mais Dieu n’est pas resté loin : en Jésus, il a souffert avec nous et pour nous. »', '"I do not have all the answers. But God did not stay far away: in Jesus, he suffered with us and for us."'], ok: 1, r: ['… Je n’avais jamais vu ça comme ça.', '… I had never seen it that way.'] },
        { t: ['« Ceux qui souffrent l’ont mérité. »', '"Those who suffer deserve it."'], r: ['C’est cruel. Et faux : regarde l’histoire de Job.', 'That is cruel. And wrong: look at the story of Job.'] },
        { t: ['« Ne pose pas de questions, crois ! »', '"Do not ask questions, just believe!"'], r: ['Donc ta foi a peur des questions ?', 'So your faith is afraid of questions?'] }]);
      await m.say(k, ['Tu ne t’es pas énervé une seule fois. Mon oncle, lui, crie quand on doute. Est-ce que… je peux venir à ton groupe d’étude ?', 'You did not lose your temper once. My uncle shouts when anyone doubts. Could I… come to your study group?']);
      await m.read('jn14_6');
    } },
  // ---- Grade 5 : Soldat de Christ (Abidjan) ----
  { id: 'w5a', grade: 5, city: 'abidjan', at: 'landmark', title: ['La tentation', 'Temptation'], giver: 'edem', gname: ['Monsieur Bamba', 'Mr Bamba'], verse: 'co10_13', reward: { faith: 25, wisdom: 10 },
    lesson: ['Être tenté n’est pas pécher. Dieu prépare toujours une issue : fuis, prie, et réponds par la Parole.', 'To be tempted is not to sin. God always provides a way out: flee, pray, and answer with the Word.'],
    async run(m) {
      const b = m.giver;
      await m.say(b, ['Bienvenue à Abidjan ! Tu cherches du travail, non ? J’ai une affaire en or. Tu signes un faux reçu, personne ne le saura, et tu gagnes six mois de salaire.', 'Welcome to Abidjan! You are looking for work, right? I have a golden deal. You sign a false receipt, no one will know, and you earn six months’ salary.']);
      await m.choice(b, ['« Alors ? Tout le monde le fait. »', '"Well? Everybody does it."'], [
        { t: ['« Non. Dieu le saurait, et moi aussi. Je préfère peu avec la justice. »', '"No. God would know, and so would I. I would rather have little with righteousness."'], ok: 1, r: ['Tss… Tu resteras pauvre avec tes principes !', 'Tsk… You will stay poor with your principles!'] },
        { t: ['« D’accord, juste cette fois. »', '"All right, just this once."'], r: ['(« Juste une fois » : c’est ainsi que commence chaque chute. Quelle issue Dieu m’a-t-il préparée ? Je peux encore dire non.)', '("Just once": that is how every fall begins. What way out has God prepared for me? I can still say no.)'] },
        { t: ['« Laisse-moi y réfléchir… combien, déjà ? »', '"Let me think about it… how much again?"'], r: ['(Joseph n’a pas négocié avec la tentation : il a fui. Plus je discute, plus je faiblis.)', '(Joseph did not negotiate with temptation: he fled. The more I discuss, the weaker I get.)'] }]);
      await m.goto('church', ['Éloigne-toi et va prier à l’église', 'Walk away and go to pray at the church'], { r: 6 });
      await m.pray(['Seigneur, merci de m’avoir donné la force de dire non.', 'Tu connais mes besoins : je te fais confiance pour mon pain.', 'Garde mes mains pures et mon cœur droit.', 'Ne me laisse pas entrer en tentation,', 'mais délivre-moi du mal.'], ['Lord, thank you for giving me the strength to say no.', 'You know my needs: I trust you for my bread.', 'Keep my hands clean and my heart upright.', 'Lead me not into temptation,', 'but deliver me from evil.']);
      await m.memorize('co10_13');
    } },
  { id: 'w5b', grade: 5, city: 'abidjan', at: 'church', title: ['L’armure de Dieu', 'The armour of God'], giver: 'mensah', gname: PASTOR.abidjan, verse: 'ep6_11', reward: { wisdom: 25, faith: 15 },
    lesson: ['Ton combat n’est pas contre les gens, mais spirituel. Chaque matin, revêts l’armure complète.', 'Your fight is not against people; it is spiritual. Every morning, put on the full armour.'],
    async run(m) {
      const p = m.giver;
      await m.say(p, ['Un soldat ne va pas au combat en pyjama ! Paul décrit six pièces dans Éphésiens 6. Je les ai cachées dans le quartier : retrouve-les.', 'A soldier does not go to battle in pyjamas! Paul describes six pieces in Ephesians 6. I have hidden them around the neighbourhood: find them.']);
      const parts = [[['La ceinture de la vérité', 'The belt of truth'], ['Vis sans mensonge : la vérité tient tout le reste en place.', 'Live without lies: truth holds everything else in place.']], [['La cuirasse de la justice', 'The breastplate of righteousness'], ['Christ est ta justice ; une vie droite protège ton cœur.', 'Christ is your righteousness; an upright life guards your heart.']], [['Les chaussures de l’Évangile de paix', 'The shoes of the gospel of peace'], ['Sois toujours prêt à porter la bonne nouvelle.', 'Always be ready to carry the good news.']], [['Le bouclier de la foi', 'The shield of faith'], ['Il éteint les flèches enflammées : doutes, peurs, accusations.', 'It quenches the fiery darts: doubts, fears, accusations.']], [['Le casque du salut', 'The helmet of salvation'], ['Protège tes pensées : tu es sauvé, tu appartiens à Dieu.', 'Guard your thoughts: you are saved, you belong to God.']], [['L’épée de l’Esprit', 'The sword of the Spirit'], ['La Parole de Dieu : la seule arme pour attaquer. « Il est écrit… »', 'The Word of God: the only weapon of attack. "It is written…"']]];
      await m.collect(6, 'church', ['Retrouve les 6 pièces de l’armure autour de l’église', 'Find the 6 pieces of the armour around the church'], { spread: 30, dz: -6, label: ['Pièce d’armure', 'Armour piece'], color: 0xc0c8d8, each: i => m.toastBig(parts[i][0], parts[i][1]) });
      await m.quiz([
        q(['Quelle pièce est la Parole de Dieu ?', 'Which piece is the Word of God?'], [['L’épée de l’Esprit', 'The sword of the Spirit'], ['Le casque', 'The helmet'], ['La ceinture', 'The belt']], 0),
        q(['Qu’éteint le bouclier de la foi ?', 'What does the shield of faith quench?'], [['Les traits enflammés du malin', 'The fiery darts of the wicked one'], ['La soif', 'Thirst'], ['Le soleil', 'The sun']], 0),
        q(['Contre qui luttons-nous ?', 'Whom do we wrestle against?'], [['Pas contre la chair et le sang, mais contre les esprits méchants', 'Not against flesh and blood, but against spiritual wickedness'], ['Contre nos voisins', 'Against our neighbours'], ['Contre les autres églises', 'Against other churches']], 0, ['(Éphésiens 6:12)', '(Ephesians 6:12)'])]);
      await m.memorize('ep6_11');
    } },
  { id: 'w5c', grade: 5, city: 'abidjan', at: 'home', title: ['Le jeûne et la prière', 'Fasting and prayer'], verse: 'mt4_4', reward: { faith: 30 },
    lesson: ['Jeûner, c’est dire à Dieu : « J’ai plus faim de toi que de pain. » On jeûne discrètement, pour chercher sa face.', 'To fast is to tell God: "I am hungrier for you than for bread." We fast discreetly, to seek his face.'],
    async run(m) {
      await m.say(ME, ['Aujourd’hui je jeûne pour chercher Dieu avant une grande décision. Jésus a dit : « Lorsque vous jeûnez… » et non « si ». Direction la plage pour prier.', 'Today I am fasting to seek God before a big decision. Jesus said "when ye fast…", not "if". Off to the beach to pray.']);
      const v1 = await m.npc('sena', 'market', ['Vendeuse d’alloco', 'Alloco seller'], { dz: 2 });
      await m.goto('market', ['Traverse le marché pour rejoindre la plage', 'Cross the market on your way to the beach'], { r: 7 });
      await m.say(v1, ['Alloco bien chaud ! Poisson braisé ! Viens goûter, c’est offert pour toi aujourd’hui !', 'Hot alloco! Grilled fish! Come and taste, it is free for you today!']);
      await m.choice(ME, ['Ton ventre gargouille…', 'Your stomach is rumbling…'], [
        { t: ['« Merci beaucoup, une autre fois ! » (et je continue en souriant)', '"Thank you so much, another time!" (and I carry on, smiling)'], ok: 1, r: ['D’accord ! Que Dieu te garde !', 'All right! God keep you!'] },
        { t: ['« Je JEÛNE, moi ! Je suis très spirituel. »', '"I am FASTING! I am very spiritual."'], r: ['(Oups. Jésus a dit de ne pas jeûner pour être vu des hommes. Reprenons, avec humilité.)', '(Oops. Jesus said not to fast to be seen by men. Let us try again, humbly.)'] },
        { t: ['Je mange vite, personne ne verra.', 'I eat quickly, no one will see.'], r: ['(Dieu voit dans le secret. « L’homme ne vivra pas de pain seulement. » Je tiens bon.)', '(God sees in secret. "Man shall not live by bread alone." I will hold on.)'] }]);
      await m.goto('beach', ['Va prier à la plage', 'Go and pray at the beach'], { r: 8 });
      await m.pray(['Seigneur, tu es ma portion et mon pain.', 'J’ai plus faim de ta présence que de nourriture.', 'Parle, ton serviteur écoute.', 'Brise en moi ce qui te résiste.', 'Que ta volonté soit faite dans ma vie.'], ['Lord, you are my portion and my bread.', 'I hunger for your presence more than for food.', 'Speak, your servant is listening.', 'Break in me whatever resists you.', 'Your will be done in my life.']);
      await m.memorize('mt4_4');
    } },
  // ---- Grade 6 : Faiseur de disciples (Lagos) ----
  { id: 'w6a', grade: 6, city: 'lagos', at: 'stadium', title: ['Un jeune croyant', 'A young believer'], giver: 'jeune', gname: ['Tunde', 'Tunde'], verse: 'tm2_2', reward: { love: 20, wisdom: 15 },
    lesson: ['Tu as reçu : transmets. Faire un disciple, c’est marcher à côté de quelqu’un, pas le dominer.', 'You have received: pass it on. Making a disciple means walking beside someone, not lording it over them.'],
    async run(m) {
      const t = m.giver;
      await m.say(t, ['Tu es le chrétien dont le pasteur Ade m’a parlé ? J’ai donné ma vie à Jésus la semaine dernière. Mais… je ne sais pas quoi faire maintenant.', 'Are you the Christian Pastor Ade told me about? I gave my life to Jesus last week. But… I do not know what to do now.']);
      await m.choice(t, ['« Hier j’ai menti à ma mère. Dieu ne veut sûrement plus de moi… »', '"Yesterday I lied to my mother. Surely God does not want me any more…"'], [
        { t: ['« Si nous confessons nos péchés, il est fidèle et juste pour pardonner. Confesse, relève-toi, et va dire la vérité à ta mère. »', '"If we confess our sins, he is faithful and just to forgive. Confess, get up, and go tell your mother the truth."'], ok: 1, r: ['C’est vrai ? Il pardonne encore ? Alors je lui parlerai ce soir.', 'Really? He still forgives? Then I will talk to her tonight.'] },
        { t: ['« En effet, tu as tout gâché. »', '"Indeed, you have ruined everything."'], r: ['(Non ! Je l’écrase au lieu de le relever. Qu’aurait fait Jésus avec Pierre après son reniement ?)', '(No! I am crushing him instead of lifting him up. What did Jesus do with Peter after his denial?)'] },
        { t: ['« Bah, mentir, ce n’est pas grave. »', '"Oh, lying is no big deal."'], r: ['(Je ne dois pas appeler bien ce que Dieu appelle mal. La grâce relève, elle n’excuse pas.)', '(I must not call good what God calls evil. Grace lifts up, it does not excuse.)'] }]);
      await m.choice(t, ['« Comment je fais pour grandir ? »', '"How do I grow?"'], [
        { t: ['« Comme un bébé : nourriture (la Bible), respiration (la prière), famille (l’église), exercice (servir et témoigner). Je t’accompagne. »', '"Like a baby: food (the Bible), breathing (prayer), family (the church), exercise (serving and witnessing). I will walk with you."'], ok: 1, r: ['Tu ferais ça pour moi ? On commence quand ?', 'You would do that for me? When do we start?'] },
        { t: ['« Débrouille-toi, j’ai appris tout seul. »', '"Figure it out, I learned on my own."'], r: ['(Faux : le pasteur Élie, sœur Akou… on m’a porté. À mon tour.)', '(Not true: Pastor Elijah, Sister Akou… I was carried. Now it is my turn.)'] }]);
      await m.read('tm2_2');
    } },
  { id: 'w6b', grade: 6, city: 'lagos', at: 'stadium', title: ['Marcher ensemble', 'Walking together'], giver: 'jeune', gname: ['Tunde', 'Tunde'], verse: 'ga6_2', reward: { love: 25, faith: 10 },
    lesson: ['Le disciple a besoin de ta présence plus que de tes discours. Porte ses fardeaux et présente-le à l’Église.', 'A disciple needs your presence more than your speeches. Bear his burdens and bring him into the Church.'],
    async run(m) {
      const t = m.giver;
      await m.say(t, ['Je n’ai jamais mis les pieds dans une église. J’ai peur qu’on me juge à cause de mon passé…', 'I have never set foot in a church. I am afraid they will judge me because of my past…']);
      await m.say(ME, ['Viens avec moi. L’église est un hôpital pour les pécheurs pardonnés, pas un musée de saints.', 'Come with me. The church is a hospital for forgiven sinners, not a museum of saints.']);
      m.follow(t);
      await m.goto('market', ['Accompagne Tunde jusqu’à l’église (passez par le marché)', 'Walk Tunde to the church (go through the market)'], { r: 9 });
      await m.say(t, ['Mes anciens amis sont là… Ils vont se moquer de moi s’ils me voient avec une Bible.', 'My old friends are over there… They will mock me if they see me with a Bible.']);
      await m.choice(ME, ['Que lui dis-tu ?', 'What do you tell him?'], [
        { t: ['« Je reste à côté de toi. Jésus n’a pas eu honte de nous ; n’ayons pas honte de lui. »', '"I am staying right beside you. Jesus was not ashamed of us; let us not be ashamed of him."'], ok: 1, r: ['… D’accord. Avec toi, j’y arrive.', '… All right. With you, I can do it.'] },
        { t: ['« Cache ta Bible, on verra plus tard. »', '"Hide your Bible, we will see later."'], r: ['(Je lui apprends à avoir honte ? Non : je lui apprends le courage, avec douceur.)', '(Am I teaching him to be ashamed? No: I will teach him courage, gently.)'] }]);
      await m.goto('church', ['Conduis Tunde à l’église', 'Take Tunde to the church'], { r: 7 });
      const p = await m.npc('mensah', 'church', PASTOR.lagos, { dx: 3, dz: -3 });
      await m.say(p, ['Tunde ! Nous t’attendions. Ici tu as une famille. Et toi, merci d’avoir marché avec lui : c’est cela, faire des disciples.', 'Tunde! We have been expecting you. Here you have a family. And you, thank you for walking with him: this is what making disciples means.']);
      m.stay(t); await m.read('ga6_2');
    } },
  { id: 'w6c', grade: 6, city: 'lagos', at: 'school', title: ['Enseigner les petits', 'Teaching the little ones'], giver: 'akou', gname: ['Sœur Ngozi', 'Sister Ngozi'], verse: 'pr22_6', reward: { wisdom: 25, love: 15 },
    lesson: ['Enseigner, c’est d’abord vivre ce que l’on dit. Les enfants retiennent les histoires… et les exemples.', 'To teach is first to live what you say. Children remember stories… and examples.'],
    async run(m) {
      const s = m.giver;
      await m.say(s, ['Dieu merci, tu es là ! Notre monitrice est malade. Peux-tu enseigner le club biblique des enfants aujourd’hui ? Le thème : David et Goliath.', 'Thank God you are here! Our teacher is sick. Can you teach the children’s Bible club today? The theme: David and Goliath.']);
      const k1 = await m.npc('enfant', 'school', ['Chidi', 'Chidi'], { dx: -3, dz: -4 });
      await m.say(k1, ['Tonton, tata ! Raconte-nous l’histoire !', 'Uncle, auntie! Tell us the story!']);
      await m.quiz([
        q(['Avec quoi David a-t-il affronté Goliath ?', 'With what did David face Goliath?'], [['Une fronde, cinq pierres… et le nom de l’Éternel', 'A sling, five stones… and the name of the LORD'], ['L’armure du roi Saül', 'King Saul’s armour'], ['Une grande armée', 'A great army']], 0, ['« Je marche contre toi au nom de l’Éternel des armées. »', '"I come to thee in the name of the LORD of hosts."']),
        q(['Quelle leçon donner aux enfants ?', 'What lesson should the children take away?'], [['Avec Dieu, on peut affronter les géants de sa vie', 'With God, we can face the giants in our lives'], ['Il faut être grand et fort pour servir Dieu', 'You must be big and strong to serve God'], ['Il vaut mieux fuir les problèmes', 'It is better to run from problems']], 0),
        q(['Chidi demande : « Dieu m’entend, même si je suis petit ? »', 'Chidi asks: "Does God hear me even though I am little?"'], [['« Oui ! Jésus a dit : Laissez venir à moi les petits enfants. »', '"Yes! Jesus said: Suffer little children to come unto me."'], ['« Attends d’être grand. »', '"Wait until you are grown up."'], ['« Seulement si tu es sage. »', '"Only if you are good."']], 0)]);
      await m.say(k1, ['Moi, mon géant, c’est la peur du noir. Ce soir je prierai comme David !', 'My giant is fear of the dark. Tonight I will pray like David!']);
      await m.memorize('pr22_6');
    } },
  // ---- Grade 7 : Ambassadeur (Paris, Londres, retour à Lomé) ----
  { id: 'w7a', grade: 7, city: 'paris', at: 'landmark', title: ['Envoyé', 'Sent'], giver: 'ama', gname: ['Grâce, étudiante', 'Grace, a student'], verse: 'mc16_15', reward: { love: 25, faith: 20 },
    lesson: ['L’Évangile est allé de Jérusalem jusqu’à toi ; maintenant il va de toi jusqu’aux nations. Tout chrétien est un envoyé.', 'The gospel travelled from Jerusalem to you; now it goes from you to the nations. Every Christian is sent.'],
    async run(m) {
      const g = m.giver;
      await m.talk([[ME, ['(Paris… L’église m’a envoyé ici soutenir une petite assemblée. Qui aurait cru que Dieu m’emmènerait si loin ?)', '(Paris… The church sent me here to support a small congregation. Who would have thought God would take me so far?)']],
        [g, ['Excusez-moi… vous venez du pays ? Je suis ici depuis deux ans pour mes études. Je n’ai personne. J’ai arrêté de prier. Je me sens invisible.', 'Excuse me… are you from back home? I have been here two years for my studies. I have no one. I stopped praying. I feel invisible.']]]);
      await m.choice(ME, ['Que fais-tu ?', 'What do you do?'], [
        { t: ['Je l’écoute longuement, puis je lui dis : « Dieu te voit. Il m’a peut-être fait traverser la mer pour te le dire. »', 'I listen to her at length, then say: "God sees you. Perhaps he brought me across the sea to tell you so."'], ok: 1, r: ['(Elle pleure.) Ça fait si longtemps que personne ne m’a écoutée…', '(She weeps.) It has been so long since anyone listened to me…'] },
        { t: ['Je lui récite dix versets sans l’écouter.', 'I recite ten verses at her without listening.'], r: ['(Elle recule. Jésus, près du puits, a d’abord demandé à boire et écouté. Écoutons.)', '(She steps back. At the well, Jesus first asked for a drink and listened. Let me listen.)'] },
        { t: ['« Désolé, je suis pressé. »', '"Sorry, I am in a hurry."'], r: ['(Le prêtre et le lévite aussi étaient pressés… Je m’arrête.)', '(The priest and the Levite were in a hurry too… I will stop.)'] }]);
      await m.read('es41_10', m.t(['Tu lui lis la promesse qui t’a porté :', 'You read her the promise that carried you:']));
      m.follow(g);
      await m.goto('church', ['Présente Grâce à l’église de Paris', 'Introduce Grace to the church in Paris'], { r: 7 });
      m.stay(g); await m.say(g, ['Une famille, ici… Merci. Dimanche, je chanterai de nouveau.', 'A family, here… Thank you. On Sunday, I will sing again.']);
      await m.memorize('mc16_15');
    } },
  { id: 'w7b', grade: 7, city: 'london', at: 'park', title: ['Le fruit de l’Esprit', 'The fruit of the Spirit'], giver: 'mensah', gname: PASTOR.london, verse: 'ga5_22', reward: { love: 20, faith: 20, wisdom: 20 },
    lesson: ['La maturité ne se mesure pas aux dons mais au fruit : ressembler à Jésus dans son caractère.', 'Maturity is not measured by gifts but by fruit: resembling Jesus in character.'],
    async run(m) {
      const p = m.giver;
      await m.say(p, ['Les dons impressionnent, mais c’est le fruit qui nourrit. Neuf saveurs d’un seul fruit ! Elles sont dans ce jardin : cueille-les.', 'Gifts impress, but it is fruit that feeds. Nine flavours of one fruit! They are in this garden: gather them.']);
      const fr = [['Amour', 'Love'], ['Joie', 'Joy'], ['Paix', 'Peace'], ['Patience', 'Longsuffering'], ['Bonté', 'Gentleness'], ['Bénignité', 'Goodness'], ['Fidélité', 'Faith'], ['Douceur', 'Meekness'], ['Tempérance', 'Temperance']];
      await m.collect(9, 'park', ['Cueille les 9 saveurs du fruit de l’Esprit', 'Gather the 9 flavours of the fruit of the Spirit'], { spread: 24, dz: -28, label: ['Fruit', 'Fruit'], color: 0xe8552b, each: i => m.toast(fr[i]) });
      await m.quiz([
        q(['On te coupe la route en t’insultant. Quel fruit est mis à l’épreuve ?', 'Someone cuts you off and insults you. Which fruit is being tested?'], [['La douceur et la patience', 'Meekness and longsuffering'], ['La joie', 'Joy'], ['Aucun, je peux répondre pareil', 'None, I can answer in kind']], 0),
        q(['Comment ce fruit pousse-t-il ?', 'How does this fruit grow?'], [['En demeurant attaché à Jésus, le cep', 'By abiding in Jesus, the vine'], ['Par mes seuls efforts', 'By my own effort alone'], ['En un jour', 'In a single day']], 0, ['« Sans moi vous ne pouvez rien faire. » (Jean 15:5)', '"Without me ye can do nothing." (John 15:5)']),
        q(['Qu’est-ce que la tempérance ?', 'What is temperance?'], [['La maîtrise de soi', 'Self-control'], ['La température', 'Temperature'], ['Le courage', 'Courage']], 0)]);
      await m.memorize('ga5_22');
      await m.say(p, ['Tu es prêt. Rentre à Lomé : ton pasteur t’attend pour quelque chose d’important.', 'You are ready. Go back to Lomé: your pastor is waiting for you for something important.']);
    } },
  { id: 'w7c', grade: 7, city: 'lome', at: 'church', title: ['Bon et fidèle serviteur', 'Good and faithful servant'], giver: 'mensah', gname: PASTOR.lome, verse: 'tm4_7', reward: { faith: 40, love: 40, wisdom: 40, talents: 100 },
    lesson: ['La maturité n’est pas une arrivée mais une marche fidèle, jour après jour, jusqu’à ce que tu voies Jésus face à face. Continue !', 'Maturity is not an arrival but a faithful walk, day after day, until you see Jesus face to face. Keep going!'],
    async run(m) {
      const p = m.giver;
      await m.say(p, [`${m.P} ! Te souviens-tu du jour où nous nous sommes rencontrés sur la place ? Regarde le chemin parcouru. Avant de t’envoyer comme ambassadeur, repassons tout cela.`, `${m.P}! Do you remember the day we met in the square? Look how far you have come. Before I send you out as an ambassador, let us go over it all.`]);
      const score = await m.quiz([
        q(['Comment est-on sauvé ?', 'How are we saved?'], [['Par grâce, par le moyen de la foi en Jésus', 'By grace, through faith in Jesus'], ['Par nos bonnes œuvres', 'By our good works'], ['Par notre famille', 'By our family']], 0),
        q(['Que signifie le baptême ?', 'What does baptism mean?'], [['Mort à l’ancienne vie, relevé pour une vie nouvelle', 'Dead to the old life, raised to a new life'], ['Un simple bain', 'Just a bath'], ['Une assurance contre la maladie', 'Insurance against sickness']], 0),
        q(['Les trois habitudes du disciple ?', 'The three habits of a disciple?'], [['Prier, lire la Parole, vivre en église', 'Pray, read the Word, live in church'], ['Critiquer, juger, comparer', 'Criticise, judge, compare'], ['Dormir, manger, voyager', 'Sleep, eat, travel']], 0),
        q(['Qui est le plus grand dans le Royaume ?', 'Who is the greatest in the Kingdom?'], [['Celui qui sert', 'The one who serves'], ['Le plus riche', 'The richest'], ['Le plus connu', 'The most famous']], 0),
        q(['Pourquoi pardonner ?', 'Why forgive?'], [['Parce que Dieu nous a pardonné en Christ', 'Because God has forgiven us in Christ'], ['Parce que l’autre le mérite toujours', 'Because the other always deserves it'], ['Pour paraître gentil', 'To look nice']], 0),
        q(['Comment témoigner ?', 'How should we witness?'], [['Avec douceur et respect', 'With meekness and fear'], ['En criant plus fort', 'By shouting louder'], ['Jamais, c’est privé', 'Never, it is private']], 0),
        q(['Que faire face à la tentation ?', 'What to do when tempted?'], [['Chercher l’issue que Dieu prépare, et résister', 'Look for the way out God provides, and resist'], ['Négocier un peu', 'Negotiate a little'], ['Céder en secret', 'Give in secretly']], 0),
        q(['L’épée de l’Esprit, c’est…', 'The sword of the Spirit is…'], [['La Parole de Dieu', 'The Word of God'], ['Ma colère', 'My anger'], ['Mon intelligence', 'My intelligence']], 0),
        q(['Faire des disciples, c’est…', 'Making disciples means…'], [['Transmettre fidèlement ce que j’ai reçu', 'Faithfully passing on what I have received'], ['Avoir des admirateurs', 'Having admirers'], ['Le travail des pasteurs seulement', 'A job for pastors only']], 0),
        q(['À quoi reconnaît-on la maturité ?', 'How is maturity recognised?'], [['Au fruit de l’Esprit dans le caractère', 'By the fruit of the Spirit in one’s character'], ['Au nombre d’années à l’église', 'By the number of years in church'], ['Au volume de la voix', 'By the volume of one’s voice']], 0)]);
      await m.say(p, [`${score}/10 du premier coup. Mais ce n’est pas ta tête que je regarde : c’est ta vie. Tu as servi, donné, pardonné, témoigné, résisté, formé un disciple.`, `${score}/10 on the first try. But it is not your head I am looking at: it is your life. You have served, given, forgiven, witnessed, resisted, and made a disciple.`]);
      await m.goto('altar', ['Avance vers l’estrade', 'Walk up to the platform'], { r: 4, dz: 3 });
      m.anim('player', 'crouch_idle');
      await m.pray(['Père, nous te présentons ton enfant.', 'Tu as commencé en lui une bonne œuvre : rends-la parfaite.', 'Remplis-le de ton Esprit, de sagesse et d’amour.', 'Envoie-le comme ambassadeur de Christ,', 'dans cette ville et jusqu’aux extrémités de la terre.', 'Qu’il entende un jour : « C’est bien, bon et fidèle serviteur. »'],
        ['Father, we present your child to you.', 'You have begun a good work in him: bring it to completion.', 'Fill him with your Spirit, with wisdom and love.', 'Send him as an ambassador of Christ,', 'in this city and to the uttermost part of the earth.', 'May he one day hear: "Well done, good and faithful servant."'], ['Prière d’envoi', 'Commissioning prayer']);
      m.anim('player', 'cheer_01'); await m.wait(2.5); m.anim('player', null);
      await m.read('tm4_7');
    } },
];

// ============ LUMIÈRE DANS LA VILLE (missions libres) ============
const pastorOf = c => PASTOR[c];
const CITY = [
  { id: 'c_lome1', city: 'lome', at: 'market', title: ['Le bon Samaritain', 'The good Samaritan'], giver: 'ouvrier', gname: ['Homme blessé', 'Injured man'], ganim: 'crouch_idle', verse: 'lc10_27', reward: { love: 25, talents: 15 },
    lesson: ['Ton prochain, c’est celui que tu trouves sur ta route et qui a besoin de toi. « Va, et toi, fais de même. »', 'Your neighbour is whoever you find on your road who needs you. "Go, and do thou likewise."'],
    async run(m) {
      const h = m.giver;
      await m.say(h, ['Aïe… Une moto m’a renversé et elle est repartie. Les gens passent sans s’arrêter…', 'Ouch… A motorbike knocked me down and drove off. People walk past without stopping…']);
      await m.choice(ME, ['Que fais-tu ?', 'What do you do?'], [
        { t: ['Je m’arrête, je le relève et je l’emmène à l’hôpital.', 'I stop, help him up and take him to the hospital.'], ok: 1, r: ['Merci… Que Dieu te bénisse.', 'Thank you… God bless you.'] },
        { t: ['Je suis pressé, quelqu’un d’autre s’en chargera.', 'I am in a hurry, someone else will handle it.'], r: ['(C’est ce qu’ont pensé le prêtre et le lévite…)', '(That is what the priest and the Levite thought…)'] },
        { t: ['Je filme pour les réseaux sociaux.', 'I film it for social media.'], r: ['(Il a besoin de mes mains, pas de mon téléphone.)', '(He needs my hands, not my phone.)'] }]);
      m.anim(h, null); m.follow(h);
      await m.goto('hospital', ['Emmène le blessé à l’hôpital (à pied ou en véhicule)', 'Take the injured man to the hospital (on foot or by vehicle)'], { r: 7 });
      const d = await m.npc('akou', 'hospital', ['Infirmière', 'Nurse'], { dx: 3, dz: -3 });
      m.stay(h); await m.say(d, ['Nous nous occupons de lui. Qui paiera les soins ?', 'We will take care of him. Who will pay for the treatment?']);
      await m.say(ME, ['Moi. Et si cela coûte davantage, je repasserai.', 'I will. And if it costs more, I will come back.']);
    } },
  { id: 'c_lome2', city: 'lome', at: 'orphanage', title: ['Le pain partagé', 'Shared bread'], giver: 'esi', gname: ['Maman Ablavi', 'Mama Ablavi'], verse: 'mt25_40', reward: { love: 25, faith: 5 },
    lesson: ['Ce que tu fais au plus petit, c’est à Jésus lui-même que tu le fais.', 'Whatever you do for the least, you do for Jesus himself.'],
    async run(m) {
      const s = m.giver;
      await m.say(s, ['Nous avons vingt enfants et la réserve est vide. Je prie depuis ce matin… Est-ce toi que Dieu envoie ?', 'We have twenty children and the pantry is empty. I have been praying since this morning… Are you the one God is sending?']);
      await m.collect(5, 'market', ['Va chercher 5 sacs de vivres au grand marché', 'Go and get 5 bags of food at the central market'], { spread: 20, dz: -26, label: ['Vivres', 'Food'], color: 0xd98a2b });
      await m.meet(s, ['Rapporte les vivres à l’orphelinat', 'Bring the food back to the orphanage'], ['Donner', 'Give']);
      const k = await m.npc('enfant', 'orphanage', ['Yawo', 'Yawo'], { dx: -3, dz: 1, anim: 'cheer_01' });
      await m.say(k, ['On va manger ! Merci tonton, merci tata ! Dieu a répondu !', 'We are going to eat! Thank you uncle, thank you auntie! God answered!']);
    } },
  { id: 'c_lome3', city: 'lome', at: 'home', dx: 22, title: ['Artisan de paix', 'Peacemaker'], giver: 'kodjo', gname: ['Voisin Kossivi', 'Neighbour Kossivi'], ganim: 'gestic_talk_neutral_01', verse: 'mt5_9', reward: { love: 15, wisdom: 15 },
    lesson: ['Écoute les deux côtés, parle doucement, cherche une solution où chacun fait un pas. Les artisans de paix ressemblent à leur Père.', 'Listen to both sides, speak softly, look for a solution where each takes a step. Peacemakers resemble their Father.'],
    async run(m) {
      const a = m.giver; const b = await m.npc('edem', 'home', ['Voisin Mawuli', 'Neighbour Mawuli'], { dx: 24.5, dz: 0.5, anim: 'gestic_talk_neutral_01' });
      await m.talk([[a, ['Ton manguier laisse tomber ses feuilles dans MA cour depuis trois ans !', 'Your mango tree has been dropping its leaves in MY yard for three years!']], [b, ['Et ta musique, chaque nuit ? Je vais couper ton fil électrique, tu verras !', 'And your music, every night? I will cut your power line, you will see!']]]);
      await m.choice(ME, ['Comment interviens-tu ?', 'How do you step in?'], [
        { t: ['« Messieurs, puis-je vous écouter l’un après l’autre ? »', '"Gentlemen, may I listen to you one after the other?"'], ok: 1, r: ['… Bon. Au moins quelqu’un écoute.', '… Fine. At least someone is listening.'] },
        { t: ['Je prends parti pour le plus fort.', 'I side with the stronger one.'], r: ['(Prendre parti jette de l’huile sur le feu.)', '(Taking sides pours oil on the fire.)'] },
        { t: ['Je crie plus fort qu’eux.', 'I shout louder than they do.'], r: ['(« Une parole dure excite la colère. »)', '("Grievous words stir up anger.")'] }]);
      await m.choice(ME, ['Que proposes-tu ?', 'What do you suggest?'], [
        { t: ['« Kossivi baisse la musique à 21 h, Mawuli taille les branches samedi — et je viens l’aider. »', '"Kossivi turns the music down at 9 pm, Mawuli trims the branches on Saturday — and I will come and help him."'], ok: 1, r: ['Ça… ça me va. Et si on partageait les mangues ?', 'That… works for me. What if we shared the mangoes?'] },
        { t: ['« Allez au tribunal. »', '"Take it to court."'], r: ['(Des voisins pour la vie, ennemis pour des feuilles ? Il y a mieux.)', '(Neighbours for life, enemies over leaves? There is a better way.)'] }]);
      m.anim(a, 'wave_01'); m.anim(b, 'claphands_01'); await m.read('pr15_1');
    } },
  { id: 'c_lome4', city: 'lome', at: 'home', dx: -22, title: ['Le fils prodigue', 'The prodigal son'], giver: 'esi', gname: ['Maman Dédé', 'Mama Dede'], verse: 'lc15_24', reward: { love: 25, faith: 10 },
    lesson: ['Le Père guette toujours le retour de ses enfants. Personne n’est allé trop loin pour revenir.', 'The Father always watches for his children’s return. No one has gone too far to come back.'],
    async run(m) {
      const mo = m.giver;
      await m.say(mo, ['Mon fils Kossi est parti il y a trois mois avec de mauvais amis. On m’a dit qu’il dort à la plage, près des pirogues. Je t’en prie, retrouve-le.', 'My son Kossi left three months ago with bad friends. They say he sleeps on the beach, near the fishing boats. Please, find him.']);
      const k = await m.npc('yao', 'beach', ['Kossi', 'Kossi'], { dx: 30, dz: 4, anim: 'crouch_idle' });
      await m.meet(k, ['Cherche Kossi à la plage', 'Look for Kossi at the beach']);
      await m.say(k, ['C’est ma mère qui t’envoie ? … J’ai tout dépensé. Mes « amis » sont partis. J’ai trop honte pour rentrer.', 'Did my mother send you? … I spent everything. My "friends" are gone. I am too ashamed to go home.']);
      await m.choice(ME, ['Que lui dis-tu ?', 'What do you tell him?'], [
        { t: ['« Jésus a raconté ton histoire : le père a couru vers son fils et l’a embrassé. Ta mère t’attend. Dieu aussi. »', '"Jesus told your story: the father ran to his son and embraced him. Your mother is waiting. So is God."'], ok: 1, r: ['Il a… couru ? Même après tout ça ? … Emmène-moi.', 'He… ran? Even after all that? … Take me home.'] },
        { t: ['« Tu l’as bien cherché. »', '"You asked for it."'], r: ['(C’est la voix du frère aîné, pas celle du Père.)', '(That is the elder brother’s voice, not the Father’s.)'] }]);
      m.anim(k, null); m.follow(k);
      await m.meet(mo, ['Ramène Kossi à sa mère', 'Bring Kossi back to his mother']);
      m.stay(k); m.anim(mo, 'cheer_01'); await m.say(mo, ['Mon fils ! Tu étais perdu, et te voilà ! Entre, on prépare le fufu !', 'My son! You were lost, and here you are! Come in, we are making fufu!']);
    } },
  { id: 'c_lome5', city: 'lome', at: 'park', dx: 12, title: ['Le portefeuille', 'The wallet'], verse: 'lc16_10', reward: { faith: 15, wisdom: 10, talents: 30 },
    lesson: ['L’intégrité, c’est faire le bien quand personne ne regarde. Dieu confie beaucoup à celui qui est fidèle dans peu.', 'Integrity is doing right when no one is watching. God entrusts much to the one who is faithful in little.'],
    async run(m) {
      await m.collect(1, 'park', ['Regarde ce qui brille dans l’herbe', 'See what is shining in the grass'], { spread: 3, dx: 12, dz: -6, label: ['Portefeuille', 'Wallet'], color: 0x6b3f1d });
      await m.say(ME, ['Un portefeuille ! 150 000 francs… et une carte : « M. Agbéko, chauffeur, gare routière ».', 'A wallet! 150,000 francs… and a card: "Mr Agbeko, driver, bus station".']);
      await m.choice(ME, ['Personne ne t’a vu.', 'No one saw you.'], [
        { t: ['Je le rapporte à son propriétaire, intact.', 'I return it to its owner, untouched.'], ok: 1, r: ['(« Tu ne déroberas point. » C’est simple.)', '("Thou shalt not steal." It is simple.)'] },
        { t: ['Je garde l’argent et je rends le portefeuille.', 'I keep the money and return the wallet.'], r: ['(Un demi-vol reste un vol.)', '(Half a theft is still a theft.)'] },
        { t: ['« C’est Dieu qui me bénit ! »', '"God is blessing me!"'], r: ['(Dieu ne bénit pas avec le bien d’autrui.)', '(God does not bless us with what belongs to others.)'] }]);
      const o = await m.npc('ouvrier', 'station', ['M. Agbéko', 'Mr Agbeko'], { dx: 5, anim: 'idle_look_around_01' });
      await m.meet(o, ['Rapporte le portefeuille à la gare routière', 'Return the wallet at the bus station'], ['Rendre', 'Return']);
      await m.say(o, ['Mon portefeuille ! C’était la scolarité de mes filles ! Rien ne manque… Pourquoi as-tu fait ça ?', 'My wallet! That was my daughters’ school fees! Nothing is missing… Why did you do that?']);
      await m.say(ME, ['Parce que j’appartiens à Jésus.', 'Because I belong to Jesus.']);
    } },
  // Cotonou
  { id: 'c_cot1', city: 'cotonou', at: 'hospital', title: ['J’étais malade…', 'I was sick…'], giver: 'akou', gname: ['Infirmière Rosine', 'Nurse Rosine'], verse: 'jc5_15', reward: { love: 20, faith: 15 },
    lesson: ['Visiter un malade, c’est lui apporter la présence de Jésus. Prie avec foi, et laisse à Dieu le résultat.', 'To visit the sick is to bring them the presence of Jesus. Pray in faith, and leave the result to God.'],
    async run(m) {
      await m.say(m.giver, ['Le vieux Papa Sossou ne reçoit jamais de visite. Il est dans la cour, sur le banc. Un peu de compagnie lui ferait du bien.', 'Old Papa Sossou never gets a visitor. He is in the yard, on the bench. A little company would do him good.']);
      const s = await m.npc('kodjo', 'hospital', ['Papa Sossou', 'Papa Sossou'], { dx: 9, dz: -8, anim: 'sit_chair_idle_neutral_01' });
      await m.meet(s, ['Va voir Papa Sossou dans la cour', 'Go and see Papa Sossou in the yard']);
      await m.say(s, ['Tu viens me voir, moi ? Mes enfants sont loin. J’ai peur de l’opération de demain.', 'You came to see me? My children are far away. I am afraid of tomorrow’s operation.']);
      await m.pray(['Seigneur Jésus, tu es le grand médecin.', 'Pose ta main sur Papa Sossou.', 'Dirige les mains des chirurgiens.', 'Chasse la peur et remplis-le de ta paix.', 'Relève-le, pour ta gloire.'], ['Lord Jesus, you are the great physician.', 'Lay your hand on Papa Sossou.', 'Guide the surgeons’ hands.', 'Drive out fear and fill him with your peace.', 'Raise him up, for your glory.']);
      await m.say(s, ['Je n’ai plus peur. Reviens me voir après… tu me liras ton Livre.', 'I am not afraid any more. Come back afterwards… you will read me your Book.']);
    } },
  { id: 'c_cot2', city: 'cotonou', at: 'market', dx: -14, title: ['Le poids juste', 'The just weight'], giver: 'sena', gname: ['Vendeuse Fifamè', 'Fifame, a trader'], verse: 'pr11_1', reward: { wisdom: 15, faith: 10, talents: 20 },
    lesson: ['L’honnêteté dans les petites choses est une prédication silencieuse.', 'Honesty in small things is a silent sermon.'],
    async run(m) {
      const s = m.giver;
      await m.say(s, ['Voilà tes tomates. Tiens, ta monnaie ! Au suivant !', 'Here are your tomatoes. Here, your change! Next!']);
      await m.say(ME, ['(Elle s’est trompée : elle m’a rendu 5 000 francs de trop.)', '(She made a mistake: she gave me 5,000 francs too much.)']);
      await m.choice(ME, ['Que fais-tu ?', 'What do you do?'], [
        { t: ['« Madame, vous m’avez rendu trop. Voici. »', '"Madam, you gave me too much change. Here."'], ok: 1, r: ['Eh ! Depuis quand les clients rendent l’argent ? Tu es chrétien, toi, non ?', 'Eh! Since when do customers give money back? You are a Christian, aren’t you?'] },
        { t: ['Je me tais : c’est son erreur.', 'I keep quiet: it is her mistake.'], r: ['(Son erreur, mais mon péché si je la garde.)', '(Her mistake, but my sin if I keep it.)'] }]);
      await m.say(s, ['Beaucoup viennent me prêcher puis discutent mes prix jusqu’à me ruiner. Toi, tu n’as rien dit et j’ai tout compris.', 'Many come and preach to me and then haggle until I am ruined. You said nothing and I understood everything.']);
    } },
  { id: 'c_cot3', city: 'cotonou', at: 'beach', title: ['La plage propre', 'The clean beach'], giver: 'jeune', gname: ['Brice', 'Brice'], verse: 'col3_23', reward: { love: 15, wisdom: 10, talents: 15 },
    lesson: ['La terre appartient à l’Éternel : en prendre soin, c’est honorer le Créateur.', "The earth is the LORD's: to care for it is to honour the Creator."],
    async run(m) {
      await m.say(m.giver, ['Avec les jeunes de l’église, on nettoie la plage. Les pêcheurs se blessent sur les déchets. Tu nous aides ?', 'With the church youth, we are cleaning the beach. The fishermen hurt themselves on the rubbish. Will you help us?']);
      await m.collect(8, 'beach', ['Ramasse 8 déchets sur la plage', 'Pick up 8 pieces of rubbish on the beach'], { spread: 34, label: ['Déchet', 'Rubbish'], color: 0x7a8a8a });
      await m.say(m.giver, ['Un pêcheur vient de demander pourquoi on fait ça gratuitement. J’ai pu lui parler de Jésus !', 'A fisherman just asked why we do this for free. I got to tell him about Jesus!']);
    } },
  // Accra
  { id: 'c_acc1', city: 'accra', at: 'church', dx: 14, title: ['Souvenez-vous des prisonniers', 'Remember the prisoners'], giver: 'ama', gname: ['Sœur Efua', 'Sister Efua'], verse: 'he13_3', reward: { love: 25, faith: 10 },
    lesson: ['Personne n’est hors de portée de la grâce. Paul a écrit des lettres depuis une prison.', 'No one is beyond the reach of grace. Paul wrote letters from a prison.'],
    async run(m) {
      await m.say(m.giver, ['Le ministère des prisons a besoin de Bibles. Elles sont dans le temple. Peux-tu les porter à la maison d’arrêt ?', 'The prison ministry needs Bibles. They are inside the temple. Can you take them to the city prison?']);
      await m.collect(4, 'altar', ['Prends les 4 cartons de Bibles dans le temple', 'Take the 4 boxes of Bibles from the temple'], { spread: 6, dz: 5, label: ['Bibles', 'Bibles'], color: 0x23324f });
      const g = await m.npc('yao', 'prison', ['Gardien', 'Guard'], { dx: 4 });
      await m.meet(g, ['Apporte les Bibles à la prison', 'Take the Bibles to the prison'], ['Remettre', 'Hand over']);
      await m.say(g, ['Encore des Bibles ? … Tu sais, le détenu Yaw a changé depuis qu’il lit ça. Il ne se bat plus. Il m’a même demandé pardon. Entre, il veut te remercier.', 'More Bibles? … You know, inmate Yaw has changed since he started reading this. He no longer fights. He even asked my forgiveness. Come in, he wants to thank you.']);
    } },
  { id: 'c_acc2', city: 'accra', at: 'stadium', dx: -10, title: ['Fair-play', 'Fair play'], giver: 'sportif', gname: ['Coach Mensah', 'Coach Mensah'], verse: 'tm4_12', reward: { wisdom: 15, love: 15 },
    lesson: ['On est témoin aussi dans le jeu : ta manière de gagner et de perdre parle de ton Maître.', 'You are a witness in play too: how you win and lose speaks of your Master.'],
    async run(m) {
      const c = m.giver;
      await m.say(c, ['Finale du tournoi des quartiers ! Tu arbitres ? À la dernière minute, notre attaquant marque… de la main. L’arbitre, c’est toi. Personne d’autre n’a vu.', 'Neighbourhood tournament final! Will you referee? In the last minute our striker scores… with his hand. You are the referee. No one else saw.']);
      await m.choice(ME, ['Ta décision ?', 'Your decision?'], [
        { t: ['Je refuse le but, même si c’est l’équipe de mon église.', 'I disallow the goal, even though it is my church’s team.'], ok: 1, r: ['… Tu as raison. Une coupe volée ne vaut rien.', '… You are right. A stolen cup is worth nothing.'] },
        { t: ['J’accorde le but : c’est pour la bonne cause.', 'I allow the goal: it is for a good cause.'], r: ['(Une « bonne cause » ne justifie pas le mensonge.)', '(A "good cause" does not justify a lie.)'] }]);
      const k = await m.npc('enfant', 'stadium', ['Kofi Jr', 'Kofi Jr'], { dx: -6, dz: -3 });
      await m.say(k, ['Coach, c’est vrai qu’un chrétien ne triche pas, même pour gagner ? Alors je veux jouer comme ça.', 'Coach, is it true a Christian does not cheat, even to win? Then I want to play like that.']);
    } },
  { id: 'c_acc3', city: 'accra', at: 'station', dx: 12, title: ['La réponse douce', 'The soft answer'], giver: 'kodjo', gname: ['Chauffeur de tro-tro', 'Tro-tro driver'], ganim: 'gestic_talk_neutral_01', verse: 'pr15_1', reward: { wisdom: 20, love: 10 },
    lesson: ['Tu ne maîtrises pas la colère des autres, mais tu maîtrises ta réponse.', 'You cannot control other people’s anger, but you can control your answer.'],
    async run(m) {
      const d = m.giver;
      await m.say(d, ['Hé toi ! Tu as rayé mon minibus avec ton sac ! Tu vas me payer, espèce d’aveugle !', 'Hey you! You scratched my minibus with your bag! You will pay for that, you blind fool!']);
      await m.choice(ME, ['(Ce n’était même pas toi.) Que réponds-tu ?', '(It was not even you.) What do you answer?'], [
        { t: ['« Je comprends que vous soyez contrarié. Regardons ensemble calmement. »', '"I understand you are upset. Let us look at it together, calmly."'], ok: 1, r: ['… Hm. La rayure est vieille, en fait. Pardon, la journée a été dure. Trois pannes.', '… Hm. The scratch is old, actually. Sorry, it has been a hard day. Three breakdowns.'] },
        { t: ['« Aveugle toi-même ! »', '"Blind fool yourself!"'], r: ['(La foule s’attroupe… Mauvaise idée. Recommençons avec douceur.)', '(A crowd is gathering… Bad idea. Let us start again, gently.)'] }]);
      await m.say(ME, ['Trois pannes… Puis-je prier pour vous et pour votre travail ?', 'Three breakdowns… May I pray for you and for your work?']);
      await m.say(d, ['Prier pour moi ? Après ce que je t’ai dit ? … Oui. S’il te plaît.', 'Pray for me? After what I said to you? … Yes. Please.']);
    } },
  // Abidjan
  { id: 'c_abi1', city: 'abidjan', at: 'station', dx: -12, title: ['Un toit pour la nuit', 'A roof for the night'], giver: 'yao', gname: ['Ibrahim', 'Ibrahim'], ganim: 'crouch_idle', verse: 'he13_16', reward: { love: 30 },
    lesson: ['La foi sans les œuvres est morte. Dire « Dieu te bénisse » à quelqu’un qui a faim ne suffit pas.', 'Faith without works is dead. Saying "God bless you" to a hungry person is not enough.'],
    async run(m) {
      const h = m.giver;
      await m.say(h, ['Grand frère, grande sœur… je dors ici depuis que mon patron m’a chassé. Je n’ai pas mangé depuis hier.', 'Big brother, big sister… I have slept here since my boss threw me out. I have not eaten since yesterday.']);
      await m.collect(2, 'market', ['Va lui chercher un repas et une couverture au marché', 'Get him a meal and a blanket at the market'], { spread: 16, dz: -24, label: ['Provision', 'Supply'], color: 0xd98a2b });
      await m.meet(h, ['Retourne voir Ibrahim', 'Go back to Ibrahim'], ['Donner', 'Give']);
      m.anim(h, null); m.follow(h);
      await m.goto('church', ['Conduis-le à l’église : elle a un foyer d’accueil', 'Take him to the church: it has a shelter'], { r: 7 });
      m.stay(h); await m.say(h, ['Un lit… et des gens qui m’appellent par mon nom. Pourquoi faites-vous ça pour un inconnu ?', 'A bed… and people who call me by my name. Why do you do this for a stranger?']);
      await m.say(ME, ['Parce que Jésus l’a fait pour nous le premier.', 'Because Jesus did it for us first.']);
    } },
  { id: 'c_abi2', city: 'abidjan', at: 'landmark', dx: -14, title: ['Le collègue découragé', 'The discouraged colleague'], giver: 'mensah', gname: ['Serge', 'Serge'], verse: 'es41_10', reward: { love: 15, faith: 15 },
    lesson: ['Une parole dite à propos relève celui qui tombe. Sois attentif aux visages autour de toi.', 'A word spoken in season lifts up the one who is falling. Pay attention to the faces around you.'],
    async run(m) {
      const s = m.giver;
      await m.say(s, ['Ils ont licencié la moitié du service ce matin. J’ai trois enfants, un loyer… Je ne dors plus. À quoi bon ?', 'They laid off half the department this morning. I have three children, rent to pay… I cannot sleep. What is the point?']);
      await m.choice(ME, ['Que fais-tu ?', 'What do you do?'], [
        { t: ['Je m’assieds avec lui, j’écoute, puis je partage Ésaïe 41:10.', 'I sit with him, listen, then share Isaiah 41:10.'], ok: 1, r: ['« Je te soutiens de ma droite… » Tu peux me l’écrire ?', '"I will uphold thee with my right hand…" Can you write it down for me?'] },
        { t: ['« Il y a pire que toi, arrête de te plaindre. »', '"Others have it worse, stop complaining."'], r: ['(Les amis de Job ont parlé trop vite, eux aussi.)', '(Job’s friends spoke too quickly as well.)'] }]);
      await m.read('es41_10');
      await m.say(s, ['Je vais afficher ça sur mon bureau. Et… merci de ne pas m’avoir fait la morale.', 'I will pin this on my desk. And… thank you for not lecturing me.']);
    } },
  { id: 'c_abi3', city: 'abidjan', at: 'hospital', dx: 12, title: ['L’amour est patient', 'Love is patient'], giver: 'esi', gname: ['Mamie Adjoua', 'Granny Adjoua'], verse: 'co13_4', reward: { love: 20, wisdom: 10 },
    lesson: ['La patience, c’est l’amour qui accepte de ralentir.', 'Patience is love that agrees to slow down.'],
    async run(m) {
      const g = m.giver;
      await m.say(g, ['Mon petit, mes jambes ne me portent plus et la pharmacie est au marché. Tu m’accompagnes ? Je marche… lentement.', 'My dear, my legs are failing me and the pharmacy is at the market. Will you walk with me? I walk… slowly.']);
      m.follow(g, 1.0);
      await m.goto('market', ['Accompagne Mamie Adjoua au marché, à son rythme (ne la distance pas !)', 'Walk Granny Adjoua to the market, at her pace (do not leave her behind!)'], { r: 8, keep: g });
      m.stay(g); await m.say(g, ['Tu ne m’as pas pressée une seule fois. Mon défunt mari disait : « On reconnaît un chrétien à sa façon d’attendre. »', 'You did not rush me once. My late husband used to say: "You can tell a Christian by the way he waits."']);
    } },
  // Lagos
  { id: 'c_lag1', city: 'lagos', at: 'market', dx: 14, title: ['Course contre la montre', 'Race against time'], giver: 'ama', gname: ['Mme Folake', 'Mrs Folake'], verse: 'ga6_9', reward: { love: 25, talents: 25 },
    lesson: ['Faire le bien demande parfois de bouleverser son programme. C’est là que l’amour devient réel.', 'Doing good sometimes means upsetting your schedule. That is where love becomes real.'],
    async run(m) {
      const f = m.giver;
      await m.say(f, ['S’il vous plaît ! Le bébé arrive et aucun taxi ne s’arrête ! Conduisez-moi à l’hôpital, vite !', 'Please! The baby is coming and no taxi will stop! Take me to the hospital, quickly!']);
      m.follow(f);
      await m.goto('hospital', ['Emmène Mme Folake à l’hôpital — prends ton véhicule ! (prudence avec les piétons)', 'Take Mrs Folake to the hospital — use your vehicle! (mind the pedestrians)'], { r: 8, timer: 150 });
      m.stay(f); await m.say(f, ['Nous y sommes ! Si c’est un garçon, il s’appellera Emmanuel : « Dieu avec nous ».', 'We made it! If it is a boy, he will be called Emmanuel: "God with us".']);
    } },
  { id: 'c_lag2', city: 'lagos', at: 'market', dx: -14, title: ['Vaincre le mal par le bien', 'Overcome evil with good'], giver: 'enfant', gname: ['Sola', 'Sola'], ganim: 'crouch_idle', verse: 'rm12_21', reward: { love: 20, wisdom: 15 },
    lesson: ['La justice sans miséricorde écrase ; la miséricorde ouvre la porte à un vrai changement.', 'Justice without mercy crushes; mercy opens the door to real change.'],
    async run(m) {
      const s = m.giver; const v = await m.npc('ouvrier', 'market', ['Commerçant', 'Trader'], { dx: -11, dz: 1, anim: 'gestic_talk_neutral_01' });
      await m.say(v, ['Voleur ! Je l’ai attrapé avec mon pain ! On va lui donner une leçon qu’il n’oubliera pas !', 'Thief! I caught him with my bread! We are going to teach him a lesson he will not forget!']);
      await m.choice(ME, ['La foule s’échauffe. Que fais-tu ?', 'The crowd is getting heated. What do you do?'], [
        { t: ['Je m’interpose calmement : « Je paie le pain. Laissez-moi parler à cet enfant. »', 'I step in calmly: "I will pay for the bread. Let me talk to this child."'], ok: 1, r: ['… Tu paies ? Bon. Mais qu’il ne revienne plus voler !', '… You are paying? Fine. But he had better not steal again!'] },
        { t: ['Je me joins à la foule.', 'I join the crowd.'], r: ['(« Que celui qui est sans péché jette la première pierre. »)', '("He that is without sin, let him first cast a stone.")'] },
        { t: ['Je passe mon chemin.', 'I walk on by.'], r: ['(Me taire ici, c’est consentir.)', '(To stay silent here is to consent.)'] }]);
      await m.say(s, ['Ma petite sœur n’a pas mangé depuis deux jours… Je sais que c’est mal.', 'My little sister has not eaten for two days… I know it is wrong.']);
      m.anim(s, null); m.follow(s);
      await m.goto('church', ['Emmène Sola à l’église : elle aide les familles', 'Take Sola to the church: it helps families'], { r: 7 });
      m.stay(s); await m.say(s, ['Ils vont aider ma sœur aussi ? … Un jour, je rembourserai le commerçant. Promis.', 'They will help my sister too? … One day I will repay the trader. I promise.']);
    } },
  { id: 'c_lag3', city: 'lagos', at: 'orphanage', title: ['La religion pure', 'Pure religion'], giver: 'esi', gname: ['Mama Bisi', 'Mama Bisi'], verse: 'jc1_27', reward: { love: 25, faith: 5 },
    lesson: ['Dieu se présente comme le Père des orphelins. Ceux qui lui ressemblent prennent soin d’eux.', 'God calls himself the Father of the fatherless. Those who resemble him care for them.'],
    async run(m) {
      await m.say(m.giver, ['Les enfants n’ont jamais eu de livres à eux. La librairie du marché nous en offre, mais je ne peux pas laisser les petits seuls.', 'The children have never had books of their own. The market bookshop is giving us some, but I cannot leave the little ones alone.']);
      await m.collect(5, 'market', ['Va chercher 5 paquets de livres au marché', 'Fetch 5 parcels of books from the market'], { spread: 20, dz: -26, label: ['Livres', 'Books'], color: 0x2a5d9f });
      await m.meet(m.giver, ['Rapporte les livres à l’orphelinat', 'Bring the books back to the orphanage'], ['Donner', 'Give']);
      const k = await m.npc('enfant', 'orphanage', ['Emeka', 'Emeka'], { dx: 3, dz: 1 });
      await m.say(k, ['Tu peux nous lire une histoire avant de partir ? Celle du berger qui cherche sa brebis ?', 'Can you read us a story before you go? The one about the shepherd looking for his sheep?']);
    } },
  // Paris
  { id: 'c_par1', city: 'paris', at: 'station', dx: 10, title: ['J’étais étranger', 'I was a stranger'], giver: 'edem', gname: ['Amadou', 'Amadou'], ganim: 'idle_look_around_01', verse: 'mt25_35', reward: { love: 25, wisdom: 5 },
    lesson: ['Accueillir l’étranger, c’est accueillir Jésus. Souviens-toi : nous sommes tous des voyageurs sur la terre.', 'To welcome the stranger is to welcome Jesus. Remember: we are all pilgrims on the earth.'],
    async run(m) {
      const a = m.giver;
      await m.say(a, ['Pardon… Je viens d’arriver. Mon téléphone est déchargé, je ne retrouve pas mon cousin, et tout le monde court ici.', 'Excuse me… I have just arrived. My phone is dead, I cannot find my cousin, and everyone here is rushing.']);
      await m.choice(ME, ['Que fais-tu ?', 'What do you do?'], [
        { t: ['« Viens, je t’offre un repas chaud et on cherche ton cousin ensemble. »', '"Come, I will get you a hot meal and we will look for your cousin together."'], ok: 1, r: ['Dieu est grand. Je priais dans le train pour rencontrer quelqu’un de bien.', 'God is great. I was praying on the train to meet a good person.'] },
        { t: ['Je lui indique vaguement une direction.', 'I vaguely point him in a direction.'], r: ['(Il a besoin d’un frère, pas d’un panneau.)', '(He needs a brother, not a signpost.)'] }]);
      m.follow(a);
      await m.goto('park', ['Accompagne Amadou au jardin, où son cousin l’attend', 'Walk Amadou to the garden, where his cousin is waiting'], { r: 8 });
      m.stay(a); await m.say(a, ['Le voilà ! Merci. Dans quelle église vas-tu ? Je veux connaître le Dieu qui t’a envoyé.', 'There he is! Thank you. Which church do you go to? I want to know the God who sent you.']);
    } },
  { id: 'c_par2', city: 'paris', at: 'park', dx: -12, title: ['Le banc du vieil homme', 'The old man’s bench'], giver: 'kodjo', gname: ['Monsieur Henri', 'Monsieur Henri'], ganim: 'sit_chair_idle_neutral_01', verse: 'mt11_28', reward: { love: 20, faith: 10 },
    lesson: ['Ton temps est parfois le plus beau cadeau. Beaucoup n’ont besoin que d’une oreille… et d’une espérance.', 'Your time is sometimes the best gift. Many need only a listening ear… and a hope.'],
    async run(m) {
      const h = m.giver;
      await m.talk([[h, ['Vous êtes la première personne à me dire bonjour cette semaine. Ma femme est partie l’an dernier. Je viens ici pour entendre des voix.', 'You are the first person to say hello to me this week. My wife passed away last year. I come here to hear voices.']],
        [ME, ['Racontez-moi comment vous l’avez rencontrée.', 'Tell me how you met her.']],
        [h, ['(Il parle longtemps. Tu écoutes.) … Elle croyait en Dieu, elle. Moi, je suis fatigué de tout.', '(He talks for a long time. You listen.) … She believed in God. As for me, I am tired of everything.']]]);
      await m.read('mt11_28', m.t(['Tu ouvres ta Bible :', 'You open your Bible:']));
      await m.say(h, ['« Du repos »… C’était son verset. Vous reviendrez demain ?', '"Rest"… That was her verse. Will you come back tomorrow?']);
    } },
  // Londres
  { id: 'c_lon1', city: 'london', at: 'beach', title: ['Sous le pont', 'Under the bridge'], giver: 'yao', gname: ['Michael', 'Michael'], ganim: 'crouch_idle', verse: 'mt25_40', reward: { love: 25, faith: 5 },
    lesson: ['Regarde les gens dans les yeux et demande-leur leur nom : la dignité est le premier don.', 'Look people in the eye and ask their name: dignity is the first gift.'],
    async run(m) {
      const h = m.giver;
      await m.say(h, ['Spare some change? … Personne ne s’arrête. Je suis devenu un meuble de cette ville.', 'Spare some change? … Nobody stops. I have become part of the furniture in this city.']);
      await m.say(ME, ['Comment t’appelles-tu ? Moi, c’est ' + m.P + '.', 'What is your name? I am ' + m.P + '.']);
      await m.say(h, ['… Michael. Ça fait des mois que personne ne me l’a demandé.', '… Michael. It has been months since anyone asked.']);
      await m.collect(2, 'market', ['Va chercher un repas chaud et un manteau au marché', 'Get a hot meal and a coat at the market'], { spread: 16, dz: -24, label: ['Provision', 'Supply'], color: 0xd98a2b });
      await m.meet(h, ['Retourne voir Michael', 'Go back to Michael'], ['Donner', 'Give']);
      await m.say(h, ['Tu es revenu. Les gens disent toujours qu’ils reviennent. Toi, tu l’as fait.', 'You came back. People always say they will. You actually did.']);
    } },
  { id: 'c_lon2', city: 'london', at: 'school', dx: 10, title: ['Ne vous inquiétez de rien', 'Be careful for nothing'], giver: 'ama', gname: ['Blessing', 'Blessing'], verse: 'ph4_6', reward: { faith: 20, love: 10 },
    lesson: ['L’inquiétude se soigne par la prière et la reconnaissance. Dépose ton fardeau, ne le reprends pas.', 'Anxiety is healed by prayer and thanksgiving. Lay your burden down and do not pick it up again.'],
    async run(m) {
      const b = m.giver;
      await m.say(b, ['Mes examens sont demain, mon loyer est en retard, ma mère est malade au pays. Je n’arrive plus à respirer.', 'My exams are tomorrow, my rent is late, my mother is sick back home. I cannot breathe.']);
      await m.read('ph4_6', m.t(['Tu lui lis doucement :', 'You read to her softly:']));
      await m.pray(['Père, voici Blessing et tout ce qui l’écrase.', 'Nous te remettons ses examens, son loyer, sa mère.', 'Merci, car tu prends soin d’elle.', 'Que ta paix, qui surpasse toute intelligence,', 'garde son cœur et ses pensées en Jésus-Christ.'], ['Father, here is Blessing and all that weighs on her.', 'We hand over to you her exams, her rent, her mother.', 'Thank you, for you care for her.', 'May your peace, which passeth all understanding,', 'keep her heart and mind through Christ Jesus.']);
      await m.say(b, ['Rien n’a changé… et pourtant je respire. On peut prier comme ça chaque semaine ?', 'Nothing has changed… and yet I can breathe. Can we pray like this every week?']);
    } },
];

WALK.forEach(m => { m.mode = 'walk'; });
CITY.forEach(m => { m.mode = 'city'; });
export const MISSIONS = [...WALK, ...CITY];
export const WALK_MISSIONS = WALK, CITY_MISSIONS = CITY;

// Paroles des passants quand on les salue
export const GREETINGS = [
  [['Bonjour ! Que Dieu te bénisse.', 'Hello! God bless you.']], [['Bonne arrivée ! La paix soit avec toi.', 'Welcome! Peace be with you.']],
  [['Ça va bien, grâce à Dieu !', 'I am fine, by God’s grace!']], [['Courage dans ton travail, le Seigneur est fidèle.', 'Keep going in your work, the Lord is faithful.']],
  [['Tu as le sourire, toi. Ça fait du bien.', 'You have a smile on you. That does one good.']], [['Dieu est bon… tout le temps !', 'God is good… all the time!']],
  [['Journée difficile… merci de m’avoir salué.', 'Hard day… thank you for greeting me.']], [['Passe à l’église dimanche, on chante bien chez nous !', 'Come by the church on Sunday, we sing well there!']],
];
