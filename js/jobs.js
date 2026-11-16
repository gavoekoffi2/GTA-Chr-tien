// Vie de tous les jours façon « San Andreas », version qui édifie :
// – contrats : un patron te confie sa moto (zémidjan) ou son taxi, tu transportes des clients et tu fais les comptes le soir ;
// – passagers « épreuves » : tristesse, accouchement, colis douteux, moqueries, mauvais payeur… ta foi en action ;
// – vie spirituelle quotidienne : prière du matin, lecture, jeûne, culte du soir, tracts, visite aux malades ;
// – jeux publics sur la grande place : Grand Jeu Biblique (quitte ou double), Exercice de l'épée, Verset à trous ;
// – boutique d'améliorations et petits investissements qui rapportent chaque jour.
import * as THREE from 'three';
import { S, L, save } from './state.js';
import { ui, esc } from './ui.js';
import { Vehicle } from './vehicles.js';
import { makeMarker } from './npc.js';
import { makeIcon, scaleIcon } from './activities.js';
import { VERSES } from './content.js';
import { fmt } from './economy.js';
import { audio } from './audio.js';

const D = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const r25 = n => Math.max(0, Math.round(n / 25) * 25);
const tx = (a, o = {}) => { let s = L(a); for (const k in o) s = s.split('{' + k + '}').join(o[k]); return s; };
const pick = a => a[Math.random() * a.length | 0];
const ME = () => S.name || L(['Moi', 'Me']);

// ---------------------------------------------------------------- patrons
const BOSS = {
  zem: { name: ['Tonton Komlan', 'Uncle Komlan'], char: 'kodjo', at: 'market', dist: 62, icon: '🛵', color: '#e0731a', veh: 'moto', vcolor: 0xd2691e, due: 2000,
    title: ['Contrat zémidjan', 'Moto-taxi contract'],
    intro: ['Mon fils, mes genoux ne me laissent plus conduire. Je te confie ma moto : tu prends des clients toute la journée, et le soir tu me verses 2 000 F de recette. Le reste est pour toi. L’essence est à ta charge. Marché conclu ?', 'My son, my knees won’t let me ride any more. I’m entrusting you with my bike: carry customers all day, and in the evening you bring me 2,000 F. The rest is yours. Fuel is on you. Deal?'] },
  taxi: { name: ['Madame Adjoa', 'Madam Adjoa'], char: 'sena', at: 'station', dist: 52, icon: '🚕', color: '#e8b400', veh: 'taxi', vcolor: null, due: 5000,
    title: ['Contrat taxi', 'Taxi contract'],
    intro: ['Komlan m’a parlé de toi : « fidèle dans les petites choses ». Mon taxi rapporte plus, mais la recette est de 5 000 F par soir. Conduis prudemment, les clients sont ma réputation.', 'Komlan told me about you: “faithful in little things”. My taxi earns more, but the takings are 5,000 F a night. Drive carefully, customers are my reputation.'] },
};
const TT = {
  accept: ['J’accepte, je serai fidèle', 'I accept, I will be faithful'], later: ['Plus tard', 'Later'], talk: ['Parler à {n} — {t}', 'Talk to {n} — {t}'],
  takeVeh: ['Voici les clés. Le véhicule est garé juste là. Que Dieu te garde sur la route !', 'Here are the keys. It is parked right there. May God keep you on the road!'],
  accounts: ['Faire les comptes avec {n}', 'Do the accounts with {n}'], noRide: ['Reviens quand tu auras transporté au moins un client.', 'Come back once you have carried at least one customer.'],
  evening: ['🌇 Le soir tombe : ramène le véhicule à {n} pour faire les comptes.', '🌇 Evening is falling: bring the vehicle back to {n} to do the accounts.'],
  sumT: ['Les comptes du soir', 'The evening accounts'], rides: ['Courses', 'Rides'], earned: ['Gagné aujourd’hui', 'Earned today'], due: ['Recette à verser', 'Takings due'], net: ['Ce qui te reste', 'What is left for you'],
  ask: ['Alors, la journée ? Combien as-tu fait ?', 'So, how was the day? How much did you make?'],
  truth: ['La vérité : {p}', 'The truth: {p}'], hide: ['« Pas grand-chose… à peine {p}. »', '“Not much… barely {p}.”'],
  truthR: ['Je le savais ! Tu es fidèle. Avec toi, mon cœur est tranquille.', 'I knew it! You are faithful. With you my heart is at peace.'],
  hideR: ['Hmm… Bon. (Il compte les billets en silence.)', 'Hmm… Fine. (He counts the notes in silence.)'],
  conscience: ['(Ta conscience te pique. « Les lèvres fausses sont en horreur à l’Éternel, mais ceux qui agissent avec vérité lui sont agréables. » — Proverbes 12:22)', '(Your conscience stings. “Lying lips are abomination to the LORD: but they that deal truly are his delight.” — Proverbs 12:22)'],
  short: ['Tu n’as pas toute la recette ({p} manquent). Que dis-tu ?', 'You don’t have all the takings ({p} short). What do you say?'],
  shortTruth: ['« Je n’ai pas tout. Voici ce que j’ai, et je te dis la vérité. »', '“I don’t have it all. Here is what I have, and I am telling you the truth.”'],
  shortLie: ['« La moto est tombée en panne, ce n’est pas ma faute ! » (mentir)', '“The bike broke down, it’s not my fault!” (lie)'],
  shortTruthR: ['Merci pour ta franchise. Les jours se suivent et ne se ressemblent pas. Demain sera meilleur.', 'Thank you for your honesty. No two days are the same. Tomorrow will be better.'],
  shortLieR: ['En panne ? Elle démarre au premier coup… Je vais réfléchir à notre contrat.', 'Broken down? It starts first time… I will think about our contract.'],
  change: ['{n} te rend la monnaie… et se trompe : il te donne {p} de trop.', '{n} gives you change… and gets it wrong: {p} too much.'],
  giveBack: ['Lui rendre l’argent en trop', 'Give back the extra money'], keepIt: ['Garder sans rien dire', 'Keep it quietly'],
  backR: ['Eh ! Même mes enfants ne feraient pas ça. Que Dieu te bénisse !', 'Eh! Even my own children wouldn’t do that. God bless you!'],
  tithe: ['Mettre de côté la dîme de ton bénéfice ({p}) pour l’église ?', 'Set aside the tithe of your profit ({p}) for the church?'], yes: ['Oui, avec joie', 'Yes, gladly'], no: ['Pas aujourd’hui', 'Not today'],
  titheR: ['« Apportez à la maison du trésor toutes les dîmes… » — Malachie 3:10', '“Bring ye all the tithes into the storehouse…” — Malachi 3:10'],
  sell: ['Tu as été fidèle {d} soirs de suite. Je suis vieux : je te vends ma moto pour {p} au lieu de 12 000 F. Tu la veux ?', 'You have been faithful {d} evenings running. I am old: I will sell you my bike for {p} instead of 12,000 F. Do you want it?'],
  buy: ['Oui, je l’achète', 'Yes, I’ll buy it'], sold: ['Elle est à toi ! « Celui qui est fidèle dans les petites choses l’est aussi dans les grandes. »', 'It is yours! “He that is faithful in that which is least is faithful also in much.”'],
  bonus: ['Prime de fidélité : +{p}. Continue comme ça !', 'Loyalty bonus: +{p}. Keep it up!'],
  recommend: ['Ma cousine Adjoa cherche un chauffeur de taxi honnête à la gare routière. Je lui ai parlé de toi. (Il faut le permis de conduire : 🛒 boutique du marché.)', 'My cousin Adjoa is looking for an honest taxi driver at the bus station. I told her about you. (You need a driving licence: 🛒 market shop.)'],
  locked: ['{n} : « Reviens quand Komlan m’aura dit du bien de toi, et avec ton permis de conduire. »', '{n}: “Come back once Komlan has spoken well of you, and with your driving licence.”'],
  suspended: ['{n} : « Après ce mensonge, je préfère attendre un peu. Reviens demain. »', '{n}: “After that lie, I would rather wait a while. Come back tomorrow.”'],
  shiftT: ['{t} · {p} gagnés · recette {d}', '{t} · {p} earned · takings {d}'], getIn: ['Monte sur le véhicule de {n} (F)', 'Get on {n}’s vehicle (F)'],
  lost: ['Le véhicule confié est resté loin derrière… {n} l’a récupéré. Contrat interrompu.', 'The entrusted vehicle was left far behind… {n} took it back. Contract interrupted.'],
};

// ---------------------------------------------------------------- passagers « épreuves »
const PAX = [
  { id: 'sad', w: 3, async run(J, j) {
    const who = L(['La passagère', 'The passenger']);
    await ui.say(who, L(['(Elle pleure doucement.) Pardon… On vient de me licencier. Trois enfants, le loyer… Je ne sais pas comment je vais rentrer leur dire.', '(She is crying softly.) Sorry… I have just been laid off. Three children, the rent… I don’t know how I’ll tell them.']));
    const k = await ui.choose(ME(), L(['Que fais-tu ?', 'What do you do?']), [L(['Je l’encourage et je lui propose de prier avec elle', 'I encourage her and offer to pray with her']), L(['Je mets la radio plus fort', 'I turn the radio up']), L(['« Chacun ses problèmes, madame. »', '“Everyone has problems, madam.”'])]);
    if (k === 0) { await ui.pray(L([['Seigneur, tu connais la peine de ta fille.', 'Toi qui nourris les oiseaux du ciel, pourvois pour elle et ses enfants.', 'Ouvre une porte de travail, donne-lui ta paix ce soir.', 'Au nom de Jésus.'], ['Lord, you know your daughter’s pain.', 'You who feed the birds of the air, provide for her and her children.', 'Open a door of work, give her your peace tonight.', 'In Jesus’ name.']]), L(['Prière dans la circulation', 'Prayer in traffic']));
      await ui.say(who, L(['Merci… Un zémidjan qui prie pour moi. Je crois que Dieu m’a vue aujourd’hui.', 'Thank you… A moto-taxi driver praying for me. I think God saw me today.'])); J.G.reward({ faith: 4, love: 5 }); j.mood = 1; }
    else if (k === 2) ui.toast(L(['(« Pleurez avec ceux qui pleurent. » — Romains 12:15)', '(“Weep with them that weep.” — Romans 12:15)']), false, 5000);
  } },
  { id: 'labor', w: 2, async run(J, j, eco) {
    const who = L(['Le mari', 'The husband']), hp = J.world.poi('hospital');
    await ui.say(who, L(['Vite, vite ! Ma femme va accoucher ! À l’hôpital, je t’en supplie !', 'Quick, quick! My wife is about to give birth! To the hospital, I beg you!']));
    j.dest = { label: L(['🏥 Hôpital — URGENCE', '🏥 Hospital — EMERGENCY']), x: hp.x, z: hp.z }; j.len = eco.quote('zem', j.dest).len; eco.targets = [j.dest]; j.special = { kind: 'labor', left: 150 };
    ui.toast(L(['🚨 Urgence ! Conduis vite mais prudemment jusqu’à l’hôpital.', '🚨 Emergency! Drive fast but carefully to the hospital.']), true, 5000);
  } },
  { id: 'parcel', w: 2, async run(J, j) {
    const who = L(['Le passager', 'The passenger']);
    const k = await ui.choose(who, L(['Écoute, petit… Ce colis, tu le déposes ce soir à une adresse que je te donnerai. 10 000 F, et tu ne poses pas de questions.', 'Listen, kid… Drop this parcel tonight at an address I’ll give you. 10,000 F, and no questions asked.']), [L(['« Non merci. Je ne transporte pas ce que je ne connais pas. »', '“No thanks. I don’t carry what I don’t know.”']), L(['« 10 000 F ? Donne ! »', '“10,000 F? Hand it over!”'])]);
    if (k === 0) { await ui.say(who, L(['… Tu es un drôle de zémidjan, toi. Bon, conduis.', '… You’re a strange moto-taxi driver. Fine, drive.'])); J.G.reward({ wisdom: 5, faith: 2 }); ui.toast(L(['« Mon fils, si des pécheurs veulent te séduire, ne te laisse pas gagner. » — Proverbes 1:10', '“My son, if sinners entice thee, consent thou not.” — Proverbs 1:10']), true, 5500); }
    else j.special = { kind: 'parcel' };
  } },
  { id: 'mock', w: 2, async run(J, j) {
    const who = L(['Le passager', 'The passenger']);
    await ui.say(who, L(['C’est quoi cet autocollant « Dieu est fidèle » ? Hahaha ! Ton Dieu va payer ton essence aussi ?', 'What’s that “God is faithful” sticker? Hahaha! Is your God going to pay for your fuel too?']));
    const k = await ui.choose(ME(), L(['Ta réponse ?', 'Your answer?']), [L(['Avec douceur : « Il m’a déjà donné bien plus. Je peux te raconter ? »', 'Gently: “He has already given me far more. Can I tell you?”']), L(['« Descends de ma moto, païen ! »', '“Get off my bike, heathen!”']), L(['Je ne dis rien et je me vexe', 'I say nothing and sulk'])]);
    if (k === 0) { await ui.say(who, L(['(Il écoute ton histoire jusqu’au bout.) … Hmm. Tu sais quoi ? Je vais peut-être passer à ton église dimanche.', '(He listens to your story to the end.) … Hmm. You know what? Maybe I’ll come by your church on Sunday.'])); J.G.reward({ faith: 3, wisdom: 4, love: 2 }); ui.toast(L(['« Soyez toujours prêts à vous défendre… avec douceur et respect. » — 1 Pierre 3:15', '“Be ready always to give an answer… with meekness and fear.” — 1 Peter 3:15']), true, 5500); j.mood = 1; }
    else if (k === 1) { j.bumps = (j.bumps || 0) + 3; ui.toast(L(['(« Une réponse douce calme la fureur. » — Proverbes 15:1)', '(“A soft answer turneth away wrath.” — Proverbs 15:1)']), false, 5000); }
  } },
  { id: 'student', w: 2, async run(J, j) {
    const who = L(['L’étudiante', 'The student']);
    const k = await ui.choose(who, L(['Monsieur, j’ai une question… Si Dieu existe, pourquoi tant de souffrance ?', 'Sir, I have a question… If God exists, why so much suffering?']), [L(['« Je n’ai pas toutes les réponses, mais Jésus a souffert avec nous et pour nous. »', '“I don’t have every answer, but Jesus suffered with us and for us.”']), L(['« Parce que les gens ne prient pas assez ! »', '“Because people don’t pray enough!”']), L(['« Pose ta question au pasteur. »', '“Ask the pastor.”'])]);
    if (k === 0) { await ui.read(VERSES.jn3_16, L(['Tu lui cites :', 'You quote to her:'])); await ui.say(who, L(['Un Dieu qui souffre avec nous… Je n’avais jamais vu ça comme ça. Merci, vraiment.', 'A God who suffers with us… I had never seen it that way. Thank you, truly.'])); J.G.reward({ wisdom: 5, love: 2 }); j.mood = 1; }
  } },
];
const DROP = [
  { id: 'nopay', w: 3, async run(J, j, fare) {
    const who = L(['Le client', 'The customer']);
    const k = await ui.choose(who, tx(['(Il fouille ses poches, gêné.) J’ai… j’ai oublié mon porte-monnaie. Je te dois {p}…', '(He searches his pockets, embarrassed.) I… I forgot my wallet. I owe you {p}…'], { p: fmt(fare) }), [L(['« Ce n’est rien, va en paix. Dieu me le rendra. »', '“It’s nothing, go in peace. God will repay me.”']), L(['Je crie et j’ameute tout le quartier', 'I shout and gather the whole street']), L(['« Tu me paieras demain, je te fais confiance. »', '“Pay me tomorrow, I trust you.”'])]);
    if (k === 0) { J.G.reward({ love: 5, faith: 2 }); ui.toast(L(['« Donnez, et il vous sera donné. » — Luc 6:38', '“Give, and it shall be given unto you.” — Luke 6:38']), true, 5000); return 0; }
    if (k === 2) { J.G.reward({ love: 3 }); S.work.iou = (S.work.iou || 0) + fare; return 0; }
    await ui.say(who, L(['Pardon, pardon ! Tiens, mon dernier billet…', 'Sorry, sorry! Here, my last note…'])); return Math.round(fare * 0.4);
  } },
  { id: 'phone', w: 2, async run(J, j, fare) {
    const k = await ui.choose(ME(), L(['Le client est parti… et a oublié un téléphone tout neuf sur le siège !', 'The customer has left… and forgotten a brand-new phone on the seat!']), [L(['Je klaxonne et je le lui rends', 'I honk and give it back to him']), L(['Je le revends au marché', 'I sell it at the market'])]);
    if (k === 0) { await ui.say(L(['Le client', 'The customer']), L(['Mon téléphone ! Toute ma vie est dedans… Tiens, prends ça pour ta peine !', 'My phone! My whole life is in it… Here, take this for your trouble!'])); J.G.reward({ faith: 3, love: 3 }); return fare + 1000; }
    ui.toast(L(['(« Que celui qui dérobait ne dérobe plus. » — Éphésiens 4:28)', '(“Let him that stole steal no more.” — Ephesians 4:28)']), false, 5000); return fare + 3000;
  } },
];

// ---------------------------------------------------------------- jeux publics
const Q = [
  [['Qui a construit l’arche ?', 'Who built the ark?'], [['Noé', 'Noah'], ['Moïse', 'Moses'], ['Abraham', 'Abraham'], ['David', 'David']]],
  [['Combien de livres compte la Bible ?', 'How many books are in the Bible?'], [['66', '66'], ['72', '72'], ['39', '39'], ['50', '50']]],
  [['Dans quelle ville Jésus est-il né ?', 'In which town was Jesus born?'], [['Bethléem', 'Bethlehem'], ['Nazareth', 'Nazareth'], ['Jérusalem', 'Jerusalem'], ['Capharnaüm', 'Capernaum']]],
  [['Qui a vaincu Goliath ?', 'Who defeated Goliath?'], [['David', 'David'], ['Saül', 'Saul'], ['Samson', 'Samson'], ['Gédéon', 'Gideon']]],
  [['Quel est le premier livre de la Bible ?', 'What is the first book of the Bible?'], [['Genèse', 'Genesis'], ['Exode', 'Exodus'], ['Matthieu', 'Matthew'], ['Psaumes', 'Psalms']]],
  [['Combien de disciples Jésus a-t-il choisis ?', 'How many disciples did Jesus choose?'], [['12', '12'], ['7', '7'], ['10', '10'], ['70', '70']]],
  [['Qui a été jeté dans la fosse aux lions ?', 'Who was thrown into the lions’ den?'], [['Daniel', 'Daniel'], ['Joseph', 'Joseph'], ['Jonas', 'Jonah'], ['Élie', 'Elijah']]],
  [['Qui a renié Jésus trois fois ?', 'Who denied Jesus three times?'], [['Pierre', 'Peter'], ['Judas', 'Judas'], ['Thomas', 'Thomas'], ['Jean', 'John']]],
  [['Quel fruit de l’Esprit vient en premier dans Galates 5:22 ?', 'Which fruit of the Spirit comes first in Galatians 5:22?'], [['L’amour', 'Love'], ['La joie', 'Joy'], ['La paix', 'Peace'], ['La patience', 'Patience']]],
  [['Qui a été avalé par un grand poisson ?', 'Who was swallowed by a great fish?'], [['Jonas', 'Jonah'], ['Pierre', 'Peter'], ['Élisée', 'Elisha'], ['Job', 'Job']]],
  [['Sur quelle montagne Moïse a-t-il reçu les dix commandements ?', 'On which mountain did Moses receive the ten commandments?'], [['Le Sinaï', 'Sinai'], ['Le Carmel', 'Carmel'], ['Les Oliviers', 'Olives'], ['Le Thabor', 'Tabor']]],
  [['Quel est le plus long livre de la Bible ?', 'What is the longest book of the Bible?'], [['Psaumes', 'Psalms'], ['Ésaïe', 'Isaiah'], ['Genèse', 'Genesis'], ['Actes', 'Acts']]],
  [['Qui était le collecteur d’impôts monté sur un sycomore ?', 'Who was the tax collector who climbed a sycamore?'], [['Zachée', 'Zacchaeus'], ['Matthieu', 'Matthew'], ['Nicodème', 'Nicodemus'], ['Lazare', 'Lazarus']]],
  [['Quel apôtre a écrit la plupart des lettres du Nouveau Testament ?', 'Which apostle wrote most of the New Testament letters?'], [['Paul', 'Paul'], ['Pierre', 'Peter'], ['Jacques', 'James'], ['Jude', 'Jude']]],
  [['Quel a été le premier miracle de Jésus ?', 'What was Jesus’ first miracle?'], [['L’eau changée en vin', 'Water into wine'], ['La multiplication des pains', 'Feeding the 5,000'], ['La marche sur l’eau', 'Walking on water'], ['La guérison d’un aveugle', 'Healing a blind man']]],
  [['Combien de jours Jésus a-t-il jeûné dans le désert ?', 'How many days did Jesus fast in the wilderness?'], [['40', '40'], ['7', '7'], ['3', '3'], ['12', '12']]],
  [['Qui a dit : « Me voici, envoie-moi » ?', 'Who said: “Here am I; send me”?'], [['Ésaïe', 'Isaiah'], ['Jérémie', 'Jeremiah'], ['Moïse', 'Moses'], ['Samuel', 'Samuel']]],
  [['Quelle femme a choisi de suivre Naomi : « ton Dieu sera mon Dieu » ?', 'Which woman chose to follow Naomi: “thy God my God”?'], [['Ruth', 'Ruth'], ['Esther', 'Esther'], ['Débora', 'Deborah'], ['Anne', 'Hannah']]],
  [['Quel est le plus grand commandement selon Jésus ?', 'What is the greatest commandment according to Jesus?'], [['Aimer Dieu de tout son cœur', 'Love God with all your heart'], ['Ne pas voler', 'Do not steal'], ['Observer le sabbat', 'Keep the sabbath'], ['Jeûner souvent', 'Fast often']]],
  [['Qui a interprété les rêves de Pharaon ?', 'Who interpreted Pharaoh’s dreams?'], [['Joseph', 'Joseph'], ['Daniel', 'Daniel'], ['Aaron', 'Aaron'], ['Jacob', 'Jacob']]],
  [['Quel livre suit les quatre Évangiles ?', 'Which book follows the four Gospels?'], [['Actes des Apôtres', 'Acts of the Apostles'], ['Romains', 'Romans'], ['Apocalypse', 'Revelation'], ['Hébreux', 'Hebrews']]],
  [['Sur quel chemin Paul a-t-il rencontré Jésus ?', 'On which road did Paul meet Jesus?'], [['Le chemin de Damas', 'The road to Damascus'], ['Le chemin d’Emmaüs', 'The road to Emmaus'], ['Le chemin de Jéricho', 'The road to Jericho'], ['Le chemin de Gaza', 'The road to Gaza']]],
];
const BOOKS = { ot: ['Genèse', 'Exode', 'Lévitique', 'Nombres', 'Deutéronome', 'Josué', 'Juges', 'Ruth', 'Samuel', 'Rois', 'Néhémie', 'Esther', 'Job', 'Psaumes', 'Proverbes', 'Ecclésiaste', 'Ésaïe', 'Jérémie', 'Ézéchiel', 'Daniel', 'Osée', 'Joël', 'Amos', 'Jonas', 'Michée', 'Malachie'],
  nt: ['Matthieu', 'Marc', 'Luc', 'Jean', 'Actes', 'Romains', 'Corinthiens', 'Galates', 'Éphésiens', 'Philippiens', 'Colossiens', 'Thessaloniciens', 'Timothée', 'Tite', 'Philémon', 'Hébreux', 'Jacques', 'Pierre', 'Jude', 'Apocalypse'] };
const BOOKS_EN = { Genèse: 'Genesis', Exode: 'Exodus', Lévitique: 'Leviticus', Nombres: 'Numbers', Deutéronome: 'Deuteronomy', Josué: 'Joshua', Juges: 'Judges', Rois: 'Kings', Néhémie: 'Nehemiah', Psaumes: 'Psalms', Proverbes: 'Proverbs', Ecclésiaste: 'Ecclesiastes', Ésaïe: 'Isaiah', Jérémie: 'Jeremiah', Ézéchiel: 'Ezekiel', Osée: 'Hosea', Joël: 'Joel', Jonas: 'Jonah', Michée: 'Micah', Malachie: 'Malachi', Matthieu: 'Matthew', Marc: 'Mark', Luc: 'Luke', Actes: 'Acts', Romains: 'Romans', Corinthiens: 'Corinthians', Éphésiens: 'Ephesians', Philippiens: 'Philippians', Colossiens: 'Colossians', Thessaloniciens: 'Thessalonians', Timothée: 'Timothy', Tite: 'Titus', Philémon: 'Philemon', Hébreux: 'Hebrews', Jacques: 'James', Pierre: 'Peter', Apocalypse: 'Revelation' };
const bk = b => (S.lang === 'en' ? BOOKS_EN[b] || b : b);
const GAMES = [
  { id: 'show', icon: '🎤', name: ['Le Grand Jeu Biblique', 'The Great Bible Game'], desc: ['Jeu public sur la grande place : 6 questions, des gains qui doublent. Tu peux t’arrêter à tout moment… ou tout risquer !', 'Public game on the main square: 6 questions, winnings that double. Stop whenever you like… or risk it all!'], fee: 200 },
  { id: 'sword', icon: '⚔', name: ['L’exercice de l’épée', 'Sword drill'], desc: ['« La Parole de Dieu est plus tranchante qu’une épée. » Ancien ou Nouveau Testament ? 10 livres, 5 secondes chacun.', '“The word of God is sharper than any sword.” Old or New Testament? 10 books, 5 seconds each.'], fee: 0 },
  { id: 'hole', icon: '🧩', name: ['Le verset à trous', 'Fill-in-the-verse'], desc: ['Retrouve le mot qui manque dans 6 versets. Ce que tu mémorises reste dans ton cœur (Psaume 119:11).', 'Find the missing word in 6 verses. What you memorise stays in your heart (Psalm 119:11).'], fee: 0 },
];

// ---------------------------------------------------------------- vie spirituelle
const DISC = {
  pray: { icon: '🙏', name: ['Prière du matin', 'Morning prayer'], where: ['À la maison, le matin', 'At home, in the morning'], r: { faith: 5 } },
  read: { icon: '📖', name: ['Lecture de la Parole', 'Reading the Word'], where: ['Téléphone ▸ Ma vie', 'Phone ▸ My life'], r: { wisdom: 5 } },
  fast: { icon: '🍞', name: ['Jeûne jusqu’au soir', 'Fast until evening'], where: ['Commencer à la maison le matin, rompre le soir', 'Start at home in the morning, break it in the evening'], r: { faith: 10, wisdom: 3 } },
  serve: { icon: '⛪', name: ['Culte du soir', 'Evening service'], where: ['À l’église, le soir', 'At church, in the evening'], r: { faith: 6, love: 3 } },
  tract: { icon: '📜', name: ['Partager l’Évangile (3 tracts)', 'Share the Gospel (3 tracts)'], where: ['Tracts à l’église, puis salue des passants', 'Tracts at church, then greet passers-by'], r: { love: 6, faith: 3 } },
  visit: { icon: '🏥', name: ['Visiter un malade', 'Visit a sick person'], where: ['À l’hôpital', 'At the hospital'], r: { love: 6 } },
};

// ---------------------------------------------------------------- boutique
export const SHOP = [
  { id: 'helmet', cat: 0, icon: '⛑', name: ['Casque homologué', 'Approved helmet'], desc: ['Prudence ! Les clients te font confiance (+5 % de pourboires).', 'Safety first! Customers trust you (+5% tips).'], p: 1500 },
  { id: 'engine', cat: 0, icon: '⚙', name: ['Moteur révisé', 'Engine tune-up'], desc: ['Ta moto et ta voiture vont 15 % plus vite.', 'Your bike and car go 15% faster.'], p: 6000 },
  { id: 'tank', cat: 0, icon: '⛽', name: ['Grand réservoir', 'Big fuel tank'], desc: ['+60 % d’autonomie pour tes véhicules.', '+60% range for your vehicles.'], p: 3500 },
  { id: 'phone', cat: 0, icon: '📱', name: ['Smartphone + appli de courses', 'Smartphone + ride app'], desc: ['Les clients te réservent : +15 % sur chaque course.', 'Customers book you: +15% on every ride.'], p: 8000 },
  { id: 'speaker', cat: 0, icon: '🔊', name: ['Petite sono de louange', 'Small worship speaker'], desc: ['Les passagers voyagent dans la joie : pourboires plus fréquents.', 'Passengers ride in joy: more frequent tips.'], p: 2500 },
  { id: 'permis', cat: 0, icon: '🪪', name: ['Permis de conduire', 'Driving licence'], desc: ['Obligatoire pour le contrat taxi de Madame Adjoa.', 'Required for Madam Adjoa’s taxi contract.'], p: 10000 },
  { id: 'bible', cat: 1, icon: '📘', name: ['Bible d’étude', 'Study Bible'], desc: ['Notes, cartes et plans de lecture : +25 % de sagesse gagnée.', 'Notes, maps and reading plans: +25% wisdom earned.'], p: 4000 },
  { id: 'guitar', cat: 1, icon: '🎸', name: ['Guitare', 'Guitar'], desc: ['Tu animes la louange : +50 % de foi au culte du soir.', 'You lead worship: +50% faith at the evening service.'], p: 7000 },
  { id: 'room', cat: 1, icon: '🛏', name: ['Louer une chambre', 'Rent a room'], desc: ['Tu peux dormir chez toi : nuit passée, énergie au maximum.', 'You can sleep at home: skip the night, full energy.'], p: 5000 },
  { id: 'kiosk', cat: 2, icon: '🏪', name: ['Kiosque de crédit téléphonique', 'Phone-credit kiosk'], desc: ['Tenu par une veuve du quartier : +1 500 F chaque matin, et elle a un revenu.', 'Run by a widow from the area: +1,500 F every morning, and she has an income.'], p: 20000, day: 1500 },
  { id: 'fleet', cat: 2, icon: '🏍', name: ['Une moto confiée à un jeune', 'A bike entrusted to a young man'], desc: ['Tu deviens patron à ton tour : recette juste de 1 000 F/jour. « Maîtres, accordez à vos serviteurs ce qui est juste. » (Col 4:1)', 'Now you are the boss: a fair 1,000 F/day. “Masters, give unto your servants that which is just.” (Col 4:1)'], p: 15000, day: 1000 },
  { id: 'farm', cat: 2, icon: '🐔', name: ['Poulailler familial', 'Family chicken coop'], desc: ['Œufs vendus au marché : +800 F chaque matin.', 'Eggs sold at the market: +800 F every morning.'], p: 12000, day: 800 },
  { id: 'orphan', cat: 3, icon: '🧒', name: ['Parrainer un orphelin (1 mois)', 'Sponsor an orphan (1 month)'], desc: ['Sa scolarité et ses repas. « La religion pure : visiter les orphelins. » (Jc 1:27)', 'Schooling and meals. “Pure religion: to visit the fatherless.” (Jas 1:27)'], p: 5000, gift: { love: 15, faith: 3 } },
  { id: 'bibles', cat: 3, icon: '📚', name: ['Offrir 10 Bibles à l’école', 'Give 10 Bibles to the school'], desc: ['Pour les élèves qui n’en ont pas.', 'For pupils who have none.'], p: 3000, gift: { love: 6, wisdom: 6 } },
];
const CAT = [['Pour tes véhicules', 'For your vehicles'], ['Pour toi', 'For you'], ['Investir (revenus chaque matin)', 'Invest (income every morning)'], ['Bénir les autres', 'Bless others']];
export function upgradeVehicle(v) {
  if (!v || v.lent || v.upg) return v; v.upg = true; const up = S.up || {};
  if (up.engine) v.maxSpeed *= 1.15; if (up.tank) { v.tank *= 1.6; } return v;
}

// ================================================================= module
export class Jobs {
  constructor(G) { this.G = G; this.inter = []; this.statics = []; this.marks = []; this.shift = null; this.dead = false; this.lastTod = G.tod; this.t = 0; this.tracts = 0; }
  get world() { return this.G.world; }
  init() {
    const W = S.work = Object.assign({ day: 1, zem: { days: 0, trust: 0, streak: 0, ban: 0 }, taxi: { days: 0, trust: 0, streak: 0, ban: 0 }, sp: { day: 0, done: {} }, streak: 0, iou: 0, games: {} }, S.work || {});
    S.up = S.up || {}; if (S.owned && S.owned.helmet) S.up.helmet = true; if (W.sp.day !== W.day) W.sp = { day: W.day, done: {} };
  }
  async setup() {
    this.init(); const G = this.G, w = this.world;
    const spot = (k, dist, ang = 0) => { const p = w.pois[k]; if (!p) return null; const q = w.roadPoint(p.x + Math.cos(ang) * dist, p.z + Math.sin(ang) * dist, 25); return w.freeNear(q.x, q.z, 1); };
    const marker = (x, z, icon, color) => { const mk = makeMarker(new THREE.Color(color).getHex()); mk.position.set(x, 0, z); const ic = makeIcon(icon, color); ic.position.y = 5.2; mk.add(ic); G.scene.add(mk); this.marks.push({ mk, ic }); return mk; };
    const npc = async (id, x, z, anim, name) => { const n = await G.crowd.addStatic(id, x, z, Math.random() * 6.28, anim, name); if (this.dead) { G.crowd.removeStatic(n); return null; } this.statics.push(n); return n; };
    // patrons
    for (const k of ['zem', 'taxi']) { const b = BOSS[k], p = spot(b.at, b.dist, k === 'zem' ? 2.2 : 4.0); if (!p) continue;
      npc(b.char, p.x, p.z, 'idle_neutral_01', b.name).then(n => { if (!n) return; marker(n.x + 1.6, n.z, b.icon, b.color);
        this.inter.push({ x: n.x, z: n.z, r: 3.2, icon: b.icon, prompt: () => this.bossPrompt(k), act: () => this.bossTalk(k, n) }); }); }
    // boutique
    const sh = spot('market', 85, 5.2); if (sh) npc('afi', sh.x, sh.z, 'idle_look_around_01', ['Boutique Bon Berger', 'Good Shepherd Shop']).then(n => { if (!n) return; marker(n.x + 1.6, n.z, '🛒', '#2e8b57'); this.inter.push({ x: n.x, z: n.z, r: 3.2, icon: '🛒', prompt: () => L(['Boutique Bon Berger : améliorations & investissements', 'Good Shepherd Shop: upgrades & investments']), act: () => this.shopMenu() }); });
    // jeux publics : animateur + spectateurs sur la grande place
    const lm = w.pois.landmark; if (lm) { const s = w.roadside(lm.x, lm.z, 22, -3), f = w.freeNear(s.x, s.z, 1);
      npc('mensah', f.x, f.z, 'gestic_talk_neutral_01', ['Animateur', 'Host']).then(n => { if (!n) return; marker(n.x + 1.6, n.z, '🎤', '#c2185b'); this.inter.push({ x: n.x, z: n.z, r: 3.4, icon: '🎤', prompt: () => L(['Jeux publics : Grand Jeu Biblique, épée, versets', 'Public games: Great Bible Game, sword drill, verses']), act: () => this.gamesMenu() }); });
      if (G.quality !== 'low') ['ama', 'yao', 'esi'].forEach((id, i) => npc(id, f.x + Math.cos(i * 2.1) * 4, f.z + Math.sin(i * 2.1) * 4, i === 1 ? 'claphands_01' : 'idle_neutral_01', '')); }
    // vie spirituelle
    const home = w.pois.home, ch = w.pois.church, hp = w.pois.hospital;
    if (home) this.inter.push({ x: home.x, z: home.z, r: 6, icon: '🏠', prompt: () => this.homePrompt(), act: () => this.homeAct() });
    if (ch) { const c = w.freeNear(ch.x - Math.cos(ch.face) * 3, ch.z + Math.sin(ch.face) * 3, 0.8); this.inter.push({ x: c.x, z: c.z, r: 3, prompt: () => this.churchPrompt(), act: () => this.churchAct() }); }
    if (hp) { const h = w.roadside(hp.x, hp.z, 10, -2.4), f = w.freeNear(h.x, h.z, 1); npc('akou', f.x, f.z, 'idle_neutral_01', ['Infirmière', 'Nurse']).then(n => n && this.inter.push({ x: n.x, z: n.z, r: 3, prompt: () => (this.done('visit') ? null : L(['Visiter un malade', 'Visit a sick person'])), act: () => this.visit() })); }
  }
  dispose() { this.dead = true; const G = this.G; this.endShift(true); for (const n of this.statics) G.crowd.removeStatic(n); for (const m of this.marks) G.scene.remove(m.mk); this.statics = []; this.marks = []; this.inter = []; }

  // ---------- utilitaires ----------
  reward(r) { this.G.reward(r); }
  done(id) { return !!S.work.sp.done[id]; }
  mark(id) { const W = S.work; if (W.sp.done[id]) return; W.sp.done[id] = 1; const d = DISC[id]; this.reward(d.r); audio.sfx('win'); ui.toast(`${d.icon} ${L(d.name)} ✔`, true, 4200); if (Object.keys(W.sp.done).length === 3) ui.toast(L(['🔥 Trois disciplines aujourd’hui ! Continue demain pour ta série.', '🔥 Three disciplines today! Keep going tomorrow for your streak.']), true, 5000); save(); }
  hour() { const t = this.G.tod; return t < 0.15 ? 'night' : t < 0.42 ? 'morning' : t < 0.74 ? 'day' : t < 0.9 ? 'evening' : 'night'; }
  fasting() { return S.work.fast === S.work.day && !S.work.sp.done.fast; }
  fareMul() { return 1 + (S.up.phone ? 0.15 : 0); }
  tipMul() { return 1 + (S.up.helmet ? 0.05 : 0) + (S.up.speaker ? 0.25 : 0); }

  // ---------- nouveau jour ----------
  newDay() {
    const W = S.work, n = Object.keys(W.sp.done).length; W.streak = n >= 3 ? W.streak + 1 : 0; W.day++; W.sp = { day: W.day, done: {} };
    let inc = 0; for (const it of SHOP) if (it.day && S.up[it.id]) inc += it.day;
    for (const k of ['zem', 'taxi']) if (W[k].ban && W[k].ban < W.day) W[k].ban = 0;
    const msg = [L(['☀ Jour {d} — une nouvelle journée !', '☀ Day {d} — a new day!']).replace('{d}', W.day)];
    if (inc) { this.G.eco.earn(inc); msg.push(tx(['Tes investissements ont rapporté +{p}.', 'Your investments brought in +{p}.'], { p: fmt(inc) })); }
    if (W.streak >= 2) msg.push(tx(['🔥 Série spirituelle : {d} jours !', '🔥 Spiritual streak: {d} days!'], { d: W.streak }));
    if (W.iou && Math.random() < 0.5) { const p = W.iou; W.iou = 0; this.G.eco.earn(p); msg.push(tx(['Le client qui avait oublié son porte-monnaie t’a remboursé {p}. « Bienheureux les miséricordieux. »', 'The customer who forgot his wallet paid you back {p}. “Blessed are the merciful.”'], { p: fmt(p) })); }
    ui.toast(msg.join('  ·  '), true, 7000); save();
  }

  // ---------- patrons et comptes ----------
  bossPrompt(k) {
    const b = BOSS[k], sh = this.shift; if (this.G.missions.active || this.G.act.active) return null;
    if (sh) return sh.kind === k ? tx(TT.accounts, { n: L(b.name) }) : null;
    return tx(TT.talk, { n: L(b.name), t: L(b.title) });
  }
  async bossTalk(k, n) {
    const G = this.G, b = BOSS[k], W = S.work, who = L(b.name); n.ch.root.rotation.y = Math.atan2(G.player.pos.x - n.x, G.player.pos.z - n.z);
    if (this.shift) { if (this.shift.kind === k) await this.accounts(n); return; }
    if (W[k].ban) { await ui.say(who, tx(TT.suspended, { n: who })); return; }
    if (k === 'taxi' && (!W.zem.recommended || !S.up.permis)) { await ui.say(who, tx(TT.locked, { n: who })); return; }
    const c = await ui.choose(who, L(b.intro), [L(TT.accept), L(TT.later)]); if (c !== 0) return;
    if (G.eco.job) G.eco.endJob(true);
    const s = this.world.roadside(n.x, n.z, 5), v = new Vehicle(b.veh, b.veh === 'taxi' ? this.world.cfg.taxi : b.vcolor, G.scene, b.veh === 'taxi' ? { driver: false, darkBumper: true, rhd: !!this.world.cfg.left, plate: 3 } : {});
    v.owned = true; v.lent = true; v.fuel = v.tank * 0.6; v.place(s.x, s.z, s.h); v.pos.y = this.world.groundY(s.x, s.z);
    v.marker = makeMarker(0xf5c542, false); v.marker.userData.dia.position.y = b.veh === 'moto' ? 1.9 : 2.4; G.scene.add(v.marker); G.vehicles.push(v);
    this.shift = { kind: k, v, earned: 0, rides: 0, boss: n, warned: false, start: W.day };
    await ui.say(who, L(TT.takeVeh)); audio.sfx('pick'); save();
  }
  endShift(silent) {
    const sh = this.shift; if (!sh) return; const G = this.G; this.shift = null;
    if (G.eco && G.eco.job && G.eco.job.kind === 'zem') G.eco.endJob(true);
    if (G.player && G.player.vehicle === sh.v) G.player.exit();
    G.scene.remove(sh.v.marker); const i = G.vehicles.indexOf(sh.v); if (i >= 0) G.vehicles.splice(i, 1); sh.v.dispose();
  }
  async accounts(n) {
    const sh = this.shift, G = this.G, k = sh.kind, b = BOSS[k], W = S.work, C = W[k], who = L(b.name);
    if (sh.rides < 1) { await ui.say(who, L(TT.noRide)); return; }
    const due = b.due, row = (a, v2, gold) => `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #fff2;${gold ? 'color:#f5c542;font-weight:800' : ''}"><span>${a}</span><b>${v2}</b></div>`;
    await ui.modal(`<div class="badge" style="font-size:50px">${b.icon}</div><h2>${L(TT.sumT)}</h2>${row(L(TT.rides), sh.rides)}${row(L(TT.earned), fmt(sh.earned))}${row(L(TT.due), fmt(due))}${row(L(TT.net), fmt(sh.earned - due), true)}`);
    let honest = true;
    if (S.money < due) {
      const c = await ui.choose(ME(), tx(TT.short, { p: fmt(due - S.money) }), [L(TT.shortTruth), L(TT.shortLie)]);
      const paid = S.money; S.money = 0; G.refreshHud(); audio.sfx('pay');
      if (c === 0) { await ui.say(who, L(TT.shortTruthR)); this.reward({ faith: 4, wisdom: 2 }); C.trust += 1; }
      else { honest = false; await ui.say(who, L(TT.shortLieR)); ui.toast(L(TT.conscience), false, 7000); C.trust = Math.max(0, C.trust - 3); C.streak = 0; if (Math.random() < 0.6) C.ban = W.day; }
      void paid;
    } else {
      const c = await ui.choose(who, L(TT.ask), [tx(TT.truth, { p: fmt(sh.earned) }), tx(TT.hide, { p: fmt(due) })]);
      if (c === 0) { await ui.say(who, L(TT.truthR)); this.reward({ faith: 3, wisdom: 4 }); C.trust += 2; if (sh.earned > due * 2.5 && Math.random() < 0.5) { const bo = r25(sh.earned * 0.1); G.eco.earn(bo); ui.toast(tx(TT.bonus, { p: fmt(bo) }), true, 4500); } }
      else { honest = false; await ui.say(who, L(TT.hideR)); ui.toast(L(TT.conscience), false, 7000); C.trust = Math.max(0, C.trust - 1); C.streak = 0; }
      S.money -= due; G.refreshHud(); audio.sfx('pay');
      if (honest && Math.random() < 0.35) { const extra = 1000; const g = await ui.choose(ME(), tx(TT.change, { n: who, p: fmt(extra) }), [L(TT.giveBack), L(TT.keepIt)]);
        if (g === 0) { await ui.say(who, L(TT.backR)); this.reward({ love: 4, faith: 2 }); C.trust += 1; } else { G.eco.earn(extra, true); ui.toast(L(['(« Celui qui est fidèle dans les moindres choses l’est aussi dans les grandes. » — Luc 16:10)', '(“He that is faithful in that which is least is faithful also in much.” — Luke 16:10)']), false, 6000); } }
      const net = sh.earned - due, ti = r25(net / 10);
      if (ti >= 100 && S.money >= ti) { const t2 = await ui.choose(ME(), tx(TT.tithe, { p: fmt(ti) }), [L(TT.yes), L(TT.no)]); if (t2 === 0) { S.money -= ti; S.given = (S.given || 0) + ti; G.refreshHud(); this.reward({ faith: 5 }); ui.toast(L(TT.titheR), true, 5500); } }
    }
    C.days++; if (honest) C.streak++;
    this.endShift(true); save();
    if (k === 'zem' && honest && C.days >= 2 && !W.zem.recommended) { W.zem.recommended = true; await ui.say(who, L(TT.recommend)); }
    if (honest && C.streak >= 3 && C.streak % 3 === 0) {
      if (k === 'zem' && !S.owned.moto) { const p = 7000; const c = await ui.choose(who, tx(TT.sell, { d: C.streak, p: fmt(p) }), [L(TT.buy), L(TT.later)]); if (c === 0 && G.eco.pay(p)) { S.owned.moto = true; G.spawnOwn('moto'); await ui.say(who, L(TT.sold)); audio.sfx('win'); } }
      else { const bo = k === 'zem' ? 3000 : 6000; G.eco.earn(bo); ui.toast(tx(TT.bonus, { p: fmt(bo) }), true, 5000); }
    }
    save();
  }
  // appelé par l'économie quand un client monte / descend
  onPickup(j, eco) {
    if (j.v && !j.v.isMoto) { /* taxi : mêmes épreuves */ }
    if (Math.random() > 0.34 || ui.busy) return;
    const tot = PAX.reduce((s, p) => s + p.w, 0); let r = Math.random() * tot, p = PAX[0]; for (const q of PAX) { r -= q.w; if (r <= 0) { p = q; break; } }
    setTimeout(() => { if (eco.job === j && j.state === 'carry' && !ui.busy) p.run(this, j, eco).catch(e => console.error(e)); }, 2500);
  }
  async onDrop(j, fare) {
    let f = fare * this.fareMul(); const sp = j.special;
    if (sp && sp.kind === 'labor') { if (sp.left > 0) { await ui.say(L(['Le mari', 'The husband']), L(['Nous sommes arrivés à temps ! … (Quelques heures plus tard) C’est une fille ! Nous l’appellerons Grâce. Merci, merci !', 'We made it in time! … (A few hours later) It’s a girl! We’ll call her Grace. Thank you, thank you!'])); this.reward({ love: 8, faith: 3 }); f += 2000; } else ui.toast(L(['Un peu tard… mais la maman et le bébé vont bien, grâce à Dieu.', 'A bit late… but mother and baby are fine, thank God.']), false, 5000); }
    else if (sp && sp.kind === 'parcel') { await ui.say(L(['Barrage de police', 'Police checkpoint']), L(['Contrôle ! Qu’y a-t-il dans ce colis ? … Des produits interdits ! Ton passager s’enfuit. Amende : 5 000 F.', 'Checkpoint! What is in this parcel? … Illegal goods! Your passenger runs off. Fine: 5,000 F.'])); S.money = Math.max(0, S.money - 5000); this.G.refreshHud(); ui.toast(L(['« Le mal poursuit les pécheurs. » — Proverbes 13:21', '“Evil pursueth sinners.” — Proverbs 13:21']), false, 6000); return 0; }
    else if (!j.mood && Math.random() < 0.16) { const tot = DROP.reduce((s, p) => s + p.w, 0); let r = Math.random() * tot, p = DROP[0]; for (const q of DROP) { r -= q.w; if (r <= 0) { p = q; break; } } f = await p.run(this, j, f); }
    if (j.mood) f += 300;
    return r25(f);
  }
  onFare(amount) { const sh = this.shift; if (!sh) return; sh.earned += amount; sh.rides++; }

  // ---------- maison, église, hôpital ----------
  homePrompt() {
    if (this.G.player.vehicle || this.G.missions.active) return null; const h = this.hour(), W = S.work;
    if (h === 'morning' && !this.done('pray')) return L(['🙏 Prière du matin', '🙏 Morning prayer']);
    if (h === 'morning' && W.fast !== W.day && !this.done('fast')) return L(['🍞 Commencer un jeûne aujourd’hui', '🍞 Start a fast today']);
    if ((h === 'evening' || h === 'night') && this.fasting()) return L(['🍞 Rompre le jeûne par la prière', '🍞 Break the fast with prayer']);
    if (S.up.room && (h === 'night' || h === 'evening')) return L(['🛏 Dormir jusqu’au matin', '🛏 Sleep until morning']);
    return null;
  }
  async homeAct() {
    const h = this.hour(), W = S.work, G = this.G;
    if (h === 'morning' && !this.done('pray')) { await ui.pray(L([['Père, merci pour cette nouvelle journée.', 'Je te confie mon travail, mes routes et mes rencontres.', 'Donne-moi d’être honnête, patient et bon.', 'Que quelqu’un te découvre aujourd’hui à travers moi.', 'Au nom de Jésus, amen.'], ['Father, thank you for this new day.', 'I commit my work, my roads and my encounters to you.', 'Make me honest, patient and kind.', 'May someone discover you today through me.', 'In Jesus’ name, amen.']]), L(['Prière du matin', 'Morning prayer'])); this.mark('pray'); return; }
    if (h === 'morning' && W.fast !== W.day) { const c = await ui.choose(ME(), L(['Jeûner jusqu’au soir ? Tu ne pourras pas acheter de repas, et tu auras moins d’énergie. « L’homme ne vivra pas de pain seulement. »', 'Fast until evening? You won’t be able to buy meals, and you’ll have less energy. “Man shall not live by bread alone.”']), [L(['Je jeûne aujourd’hui', 'I fast today']), L(['Pas aujourd’hui', 'Not today'])]); if (c === 0) { W.fast = W.day; ui.toast(L(['🍞 Jeûne commencé. Reviens ici le soir pour le rompre dans la prière.', '🍞 Fast begun. Come back here in the evening to break it in prayer.']), true, 5000); save(); } return; }
    if (this.fasting()) { await ui.read(VERSES.mt4_4 || VERSES.jn3_16, L(['Tu romps le jeûne en méditant :', 'You break the fast meditating:'])); S.energy = 100; this.mark('fast'); return; }
    if (S.up.room) { await ui.fade(true); G.tod = 0.2; this.lastTod = 0.2; S.energy = 100; this.newDay(); await ui.fade(false); }
  }
  churchPrompt() {
    if (this.G.player.vehicle || this.G.missions.active) return null; const h = this.hour();
    if ((h === 'evening' || h === 'night') && !this.done('serve')) return L(['⛪ Assister au culte du soir', '⛪ Attend the evening service']);
    if (!this.done('tract') && this.tracts <= 0) return L(['📜 Prendre des tracts pour évangéliser', '📜 Take tracts to share the Gospel']);
    return null;
  }
  async churchAct() {
    const h = this.hour();
    if ((h === 'evening' || h === 'night') && !this.done('serve')) {
      await ui.fade(true); await ui.fade(false);
      await ui.pray(L([['« Que tout ce qui respire loue l’Éternel ! »', 'Les chants montent, les mains se lèvent.', 'Le pasteur prêche sur la fidélité dans les petites choses.', 'Tu repars le cœur léger et fortifié.'], ['“Let every thing that hath breath praise the LORD!”', 'The songs rise, hands are lifted.', 'The pastor preaches on faithfulness in little things.', 'You leave with a light and strengthened heart.']]), L(['Culte du soir', 'Evening service']));
      if (S.up.guitar) { this.reward({ faith: 3 }); ui.toast(L(['🎸 Tu as accompagné la louange à la guitare !', '🎸 You played guitar for the worship!']), true); }
      this.mark('serve'); return;
    }
    this.tracts = 3; S.work.tractGiven = 0; ui.toast(L(['📜 3 tracts en poche. Salue des passants (E) pour leur parler de Jésus.', '📜 3 tracts in your pocket. Greet passers-by (E) to tell them about Jesus.']), true, 5500);
  }
  // appelé quand on salue un passant ; renvoie true si un tract a été donné
  async greet() {
    if (this.tracts <= 0) return false; this.tracts--; S.work.tractGiven = (S.work.tractGiven || 0) + 1;
    const lines = [['Jésus t’aime ? … Merci, je vais lire ça ce soir.', 'Jesus loves me? … Thanks, I’ll read it tonight.'], ['J’ai grandi à l’église… j’ai arrêté. Peut-être qu’il est temps de revenir.', 'I grew up in church… I stopped. Maybe it’s time to come back.'], ['Non merci. … Bon, donne quand même, je le lirai.', 'No thanks. … Well, give it anyway, I’ll read it.'], ['Tu sais, je priais justement ce matin pour un signe…', 'You know, I was praying this very morning for a sign…']];
    await ui.say(L(['Un passant', 'A passer-by']), L(pick(lines))); this.reward({ love: 1 });
    if (S.work.tractGiven >= 3) this.mark('tract'); else ui.toast(tx(['📜 Encore {n} tract(s).', '📜 {n} tract(s) left.'], { n: this.tracts }));
    return true;
  }
  async visit() {
    const who = L(['Papa Kodjo, hospitalisé', 'Papa Kodjo, in hospital']);
    await ui.say(who, pick(L([['Personne n’est venu me voir depuis une semaine… Merci d’être là.', 'Le docteur dit que l’opération est demain. J’ai peur.', 'Mes enfants sont loin, à Lomé ou à Paris. Ta visite me fait du bien.'], ['No one has visited me for a week… Thank you for coming.', 'The doctor says the operation is tomorrow. I’m scared.', 'My children are far away, in Lomé or Paris. Your visit does me good.']])));
    await ui.pray(L([['Seigneur, pose ta main sur Papa Kodjo.', 'Guide les médecins, enlève la peur.', 'Qu’il sache qu’il n’est pas seul : tu es là.', 'Amen.'], ['Lord, lay your hand on Papa Kodjo.', 'Guide the doctors, take away the fear.', 'Let him know he is not alone: you are here.', 'Amen.']]), L(['Prière pour le malade', 'Prayer for the sick']));
    this.mark('visit');
  }
  async readWord() {
    if (this.done('read')) { ui.toast(L(['Tu as déjà lu la Parole aujourd’hui. Médite-la !', 'You have already read the Word today. Meditate on it!'])); return; }
    const keys = Object.keys(VERSES), k = keys[(S.work.day * 7 + 3) % keys.length]; if (!S.verses.includes(k)) S.verses.push(k);
    await ui.read(VERSES[k], L(['📖 Lecture du jour :', '📖 Today’s reading:'])); this.mark('read');
  }

  // ---------- jeux publics ----------
  async gamesMenu() {
    const W = S.work, box = ui.openModal(`<div class="badge" style="font-size:50px">🎤</div><h2>${L(['Jeux publics de la place', 'Public games on the square'])}</h2><p style="opacity:.85">${L(['« Venez, venez ! Qui connaît la Parole ? » La foule se rassemble…', '“Come, come! Who knows the Word?” The crowd gathers…'])}</p><div class="opts">${GAMES.map((g, i) => `<button data-g="${i}"><b>${g.icon} ${esc(L(g.name))}</b><br><small>${esc(L(g.desc))}${g.fee ? ' · ' + L(['inscription', 'entry']) + ' ' + fmt(g.fee) : ''} · 🏆 ${W.games[g.id] !== undefined ? W.games[g.id] : '—'}</small></button>`).join('')}</div><div class="opts" style="align-items:center"><button class="big" id="gm-x" style="min-width:200px;text-align:center">${L(['Fermer', 'Close'])}</button></div>`);
    box.querySelector('#gm-x').onclick = () => ui.closeModal();
    box.querySelectorAll('[data-g]').forEach(b => b.onclick = () => { const g = GAMES[+b.dataset.g]; ui.closeModal(); if (g.fee && !this.G.eco.pay(g.fee)) return; this['g_' + g.id]().catch(e => console.error(e)); });
  }
  best(id, v) { const W = S.work; if (W.games[id] === undefined || v > W.games[id]) { W.games[id] = v; return true; } return false; }
  async g_show() {
    const qs = Q.slice().sort(() => Math.random() - 0.5).slice(0, 6), ladder = [500, 1000, 2000, 4000, 8000, 16000]; let bank = 0, i = 0;
    for (; i < qs.length; i++) {
      const [q, o] = qs[i], ok = await ui.ask({ q, o, a: 0 }, i + 1, qs.length);
      if (!ok) { audio.sfx('deny'); bank = i >= 3 ? ladder[2] : 0; await ui.say(L(['Animateur', 'Host']), i >= 3 ? tx(['Oh non ! Mais tu repars avec le palier : {p}. Bravo quand même !', 'Oh no! But you leave with the safe level: {p}. Well done anyway!'], { p: fmt(bank) }) : L(['Oh non ! La foule t’applaudit quand même. Reviens t’entraîner : lis ta Bible !', 'Oh no! The crowd applauds you anyway. Come back and practise: read your Bible!'])); break; }
      bank = ladder[i]; audio.sfx('coin');
      if (i < qs.length - 1) { const c = await ui.choose(L(['Animateur', 'Host']), tx(['Bonne réponse ! Tu as {p}. La foule crie ! Tu continues pour {n} ?', 'Correct! You have {p}. The crowd roars! Continue for {n}?'], { p: fmt(bank), n: fmt(ladder[i + 1]) }), [L(['Je continue !', 'I continue!']), L(['Je m’arrête et j’empoche', 'I stop and take the money'])]); if (c === 1) { i++; break; } }
    }
    if (bank) { this.G.eco.earn(bank); this.reward({ wisdom: 2 + i * 2 }); ui.toast(tx(['🎤 Grand Jeu Biblique : +{p} !', '🎤 Great Bible Game: +{p}!'], { p: fmt(bank) }), true, 5000); }
    if (i >= qs.length && bank === ladder[5]) ui.toast(L(['🏆 SANS FAUTE ! Toute la place t’acclame !', '🏆 PERFECT! The whole square cheers you!']), true, 5000);
    this.best('show', bank); save();
  }
  async g_sword() {
    const all = [...BOOKS.ot.map(b => [b, 0]), ...BOOKS.nt.map(b => [b, 1])].sort(() => Math.random() - 0.5).slice(0, 10); let score = 0;
    for (let n = 0; n < all.length; n++) {
      const [b, nt] = all[n];
      const r = await new Promise(res => {
        const box = ui.openModal(`<h3>⚔ ${n + 1}/10 · ${score} ✔</h3><p style="font-size:34px;font-weight:900;text-align:center;margin:18px 0">${esc(bk(b))}</p><div style="height:8px;background:#fff2;border-radius:4px;overflow:hidden"><div id="sw-bar" style="height:100%;width:100%;background:#f5c542;transition:width 5s linear"></div></div><div class="opts"><button data-a="0"><b>${L(['Ancien Testament', 'Old Testament'])}</b></button><button data-a="1"><b>${L(['Nouveau Testament', 'New Testament'])}</b></button></div>`);
        requestAnimationFrame(() => requestAnimationFrame(() => { const bar = box.querySelector('#sw-bar'); if (bar) bar.style.width = '0%'; }));
        let fin = false; const end = v => { if (fin) return; fin = true; clearTimeout(to); ui.closeModal(); res(v); };
        const to = setTimeout(() => end(-1), 5000); box.querySelectorAll('[data-a]').forEach(btn => btn.onclick = () => end(+btn.dataset.a));
      });
      if (r === nt) { score++; audio.sfx('pick'); } else audio.sfx('deny');
    }
    const money = score * 100; if (money) this.G.eco.earn(money); this.reward({ wisdom: score });
    await ui.say(L(['Animateur', 'Host']), tx(['{s}/10 ! « Ta parole est une lampe à mes pieds. » {m}', '{s}/10! “Thy word is a lamp unto my feet.” {m}'], { s: score, m: money ? '+' + fmt(money) : '' }));
    this.best('sword', score); save();
  }
  async g_hole() {
    const keys = Object.keys(VERSES).sort(() => Math.random() - 0.5).slice(0, 6); let score = 0;
    for (let n = 0; n < keys.length; n++) {
      const v = VERSES[keys[n]], txt = L(v.text), words = txt.split(/\s+/), cand = words.map((w, i) => [w.replace(/[^\p{L}’'-]/gu, ''), i]).filter(([w]) => w.length >= 5);
      if (!cand.length) continue; const [ans, idx] = pick(cand);
      const pool = Object.values(VERSES).flatMap(x => L(x.text).split(/\s+/)).map(w => w.replace(/[^\p{L}’'-]/gu, '')).filter(w => w.length >= 5 && w.toLowerCase() !== ans.toLowerCase());
      const opts = [[ans, ans], ...[...new Set(pool)].sort(() => Math.random() - 0.5).slice(0, 3).map(w => [w, w])];
      const shown = words.map((w, i) => (i === idx ? w.replace(ans, '_____') : w)).join(' ');
      if (await ui.ask({ q: [`« ${shown} » — ${v.ref[0]}`, `“${shown}” — ${v.ref[1]}`], o: opts, a: 0 }, n + 1, keys.length)) { score++; if (!S.verses.includes(keys[n])) S.verses.push(keys[n]); }
    }
    const money = score * 150; if (money) this.G.eco.earn(money); this.reward({ wisdom: score * 2, faith: score >= 5 ? 3 : 0 });
    ui.toast(tx(['🧩 {s}/6 versets retrouvés  {m}', '🧩 {s}/6 verses found  {m}'], { s: score, m: money ? '+' + fmt(money) : '' }), true, 5000);
    this.best('hole', score); save();
  }

  // ---------- boutique ----------
  shopMenu(fromPhone) {
    const G = this.G, bt = it => { const own = S.up[it.id] && !it.gift; return `<button data-s="${it.id}" ${own ? 'disabled style="opacity:.55"' : ''}><div class="gradeline"><div class="ic">${it.icon}</div><div style="flex:1;text-align:left"><b style="display:block">${esc(L(it.name))}</b><small style="display:block;opacity:.8">${esc(L(it.desc))}</small></div><b style="white-space:nowrap">${own ? '✔' : fmt(it.p)}</b></div></button>`; };
    const box = ui.openModal(`<h2>🛒 ${L(['Boutique Bon Berger', 'Good Shepherd Shop'])}</h2><p style="opacity:.85">💰 ${fmt(S.money)}${fromPhone ? ' · ' + L(['livraison par zémidjan', 'delivered by moto-taxi']) : ''}</p>${CAT.map((c, ci) => `<h3>${esc(L(c))}</h3><div class="opts">${SHOP.filter(it => it.cat === ci).map(bt).join('')}</div>`).join('')}<div class="opts" style="align-items:center"><button class="big gold" id="sh-x" style="min-width:200px;text-align:center">${L(['Fermer', 'Close'])}</button></div>`);
    box.querySelector('#sh-x').onclick = () => ui.closeModal();
    box.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { const it = SHOP.find(q => q.id === b.dataset.s); if (!G.eco.pay(it.p)) return; ui.closeModal(); this.bought(it); });
  }
  bought(it) {
    const G = this.G; audio.sfx('win');
    if (it.gift) { S.given = (S.given || 0) + it.p; this.reward(it.gift); ui.toast(`${it.icon} ${L(['Merci ! Ce don va changer une vie.', 'Thank you! This gift will change a life.'])}`, true, 5000); save(); return; }
    S.up[it.id] = true; if (it.id === 'helmet') S.owned.helmet = true;
    if (it.id === 'engine' || it.id === 'tank') for (const v of G.vehicles) { if (v.lent) continue; v.upg = false; if (it.id === 'engine') { v.maxSpeed *= 1.15; } else { v.tank *= 1.6; } }
    ui.toast(`${it.icon} ${L(it.name)} — ${L(it.day ? ['Investissement réalisé ! Revenus chaque matin.', 'Investment made! Income every morning.'] : ['Acheté ! Prends-en soin.', 'Bought! Take good care of it.'])}`, true, 5000); save();
  }

  // ---------- onglet « Ma vie » du téléphone ----------
  phoneHTML() {
    const W = S.work, d = id => `<div class="item ${this.done(id) ? 'done' : ''}"><b>${this.done(id) ? '✔' : DISC[id].icon} ${esc(L(DISC[id].name))}</b><small>${esc(L(DISC[id].where))}</small></div>`;
    const ups = SHOP.filter(it => S.up[it.id] && !it.gift).map(it => it.icon).join(' ') || '—', inc = SHOP.filter(it => it.day && S.up[it.id]).reduce((s, it) => s + it.day, 0);
    const sh = this.shift ? `<p>🔑 ${esc(L(BOSS[this.shift.kind].title))} : ${this.shift.rides} ${L(['courses', 'rides'])}, ${fmt(this.shift.earned)}</p>` : '';
    return `<h3>☀ ${L(['Jour', 'Day'])} ${W.day} · ${L({ morning: ['Matin', 'Morning'], day: ['Journée', 'Daytime'], evening: ['Soir', 'Evening'], night: ['Nuit', 'Night'] }[this.hour()])}${W.streak ? ` · 🔥 ${W.streak}` : ''}</h3>${sh}
      <h3>${L(['Ma vie spirituelle aujourd’hui', 'My spiritual life today'])}</h3><div class="list">${Object.keys(DISC).map(d).join('')}</div>
      <div class="opts"><button class="big" data-life="read" style="text-align:center">📖 ${L(['Lire la Parole du jour', 'Read today’s Word'])}</button><button class="big" data-life="shop" style="text-align:center">🛒 ${L(['Boutique (livraison)', 'Shop (delivery)'])}</button></div>
      <h3>${L(['Mon travail', 'My work'])}</h3><div class="list"><div class="item"><b>🛵 ${esc(L(BOSS.zem.name))}</b><small>${W.zem.days} ${L(['soirs de comptes', 'evenings of accounts'])} · ${L(['confiance', 'trust'])} ${'★'.repeat(Math.min(5, W.zem.trust))}${'☆'.repeat(Math.max(0, 5 - W.zem.trust))}</small></div><div class="item ${W.zem.recommended && S.up.permis ? '' : 'lock'}"><b>🚕 ${esc(L(BOSS.taxi.name))}</b><small>${W.zem.recommended && S.up.permis ? `${W.taxi.days} ${L(['soirs', 'evenings'])} · ${L(['confiance', 'trust'])} ${'★'.repeat(Math.min(5, W.taxi.trust))}` : L(['Recommandation de Komlan + permis requis', 'Komlan’s recommendation + licence required'])}</small></div></div>
      <p style="opacity:.85">${L(['Améliorations', 'Upgrades'])} : ${ups}${inc ? ` · ${L(['revenus', 'income'])} +${fmt(inc)}/${L(['jour', 'day'])}` : ''}</p>`;
  }
  phoneBind(box, close) {
    box.querySelectorAll('[data-life]').forEach(b => b.onclick = () => { close(); if (b.dataset.life === 'read') this.readWord(); else this.shopMenu(true); });
  }

  // ---------- boucle ----------
  nearby() {
    const pl = this.G.player, pp = pl.pos; let best = null, bd = 1e9;
    for (const it of this.inter) { if (pl.vehicle) continue; const d = D(it, pp); if (d < it.r && d < bd) { const p = it.prompt(); if (p) { bd = d; best = { prompt: p, act: it.act }; } } }
    return best;
  }
  mapIcons() { const out = this.inter.filter(it => it.icon).map(it => ({ x: it.x, z: it.z, ch: it.icon })); if (this.shift && !this.shift.v.rider) out.push({ x: this.shift.v.pos.x, z: this.shift.v.pos.z, ch: '🔑' }); return out; }
  status() {
    const sh = this.shift; if (!sh) return null; const G = this.G, b = BOSS[sh.kind], title = tx(TT.shiftT, { t: L(b.title), p: fmt(sh.earned), d: fmt(b.due) });
    if (G.player.vehicle !== sh.v) return { title, text: tx(TT.getIn, { n: L(b.name) }), x: sh.v.pos.x, z: sh.v.pos.z };
    const h = this.hour(); if ((h === 'evening' || h === 'night') && sh.rides) return { title, text: tx(TT.accounts, { n: L(b.name) }), x: sh.boss.x, z: sh.boss.z };
    return null; // le statut du travail de zémidjan (économie) prend le relais
  }
  update(dt) {
    const G = this.G; if (!G.player) return; this.t += dt;
    const t = G.tod; if (this.lastTod < 0.15 && t >= 0.15 && t - this.lastTod < 0.1) this.newDay(); this.lastTod = t;
    for (const m of this.marks) { m.ic.position.y = 5.2 + Math.sin(this.t * 2) * 0.25; if (G.player.cam) scaleIcon(m.ic, G.player.cam, 2.4); }
    const sh = this.shift; if (!sh) return;
    sh.v.marker.visible = !sh.v.rider; sh.v.marker.position.set(sh.v.pos.x, 0, sh.v.pos.z); sh.v.marker.userData.dia.rotation.y += dt * 2;
    const eco = G.eco, inV = G.player.vehicle === sh.v;
    if (inV && !eco.job && !eco.ride && !G.act.active && !G.missions.active && !ui.busy) eco.toggleZemJob();
    if (eco.job && eco.job.special && eco.job.special.kind === 'labor') { eco.job.special.left -= dt; }
    const h = this.hour(); if ((h === 'evening') && !sh.warned && sh.rides) { sh.warned = true; ui.toast(tx(TT.evening, { n: L(BOSS[sh.kind].name) }), true, 6500); }
    if (!inV && D(sh.v.pos, G.player.pos) > 900) { ui.toast(tx(TT.lost, { n: L(BOSS[sh.kind].name) }), false, 6000); this.endShift(true); }
  }
}
