import { DEFAULT_LOCALE, localePath, type Locale, LOCALES } from './locales'

/**
 * Leaving reason ids, in display order. They are the Umami `reason` property
 * values, so they never change with the locale.
 */
export const GOODBYE_REASON_IDS = [
  'didnt-recognize',
  'permissions',
  'one-time',
  'missing-feature',
  'bug',
  'switched',
  'other',
] as const

export type GoodbyeReasonId = (typeof GOODBYE_REASON_IDS)[number]

/**
 * Install redirect URL for the Goodbye page, tagged with the Campaign `goodbye`
 * so the server log counts reinstalls from this page.
 */
export const GOODBYE_REINSTALL_HREF = '/install?c=goodbye'

/**
 * Where the feature-request and bug templates live on GitHub.
 */
export const GOODBYE_FEATURE_REQUEST_HREF =
  'https://github.com/AndryOre/snug/issues/new?template=2-feature-request.yml'
export const GOODBYE_BUG_REPORT_HREF =
  'https://github.com/AndryOre/snug/issues/new?template=1-bug-report.yml'

/**
 * Contact address shown in the replies.
 */
export const GOODBYE_EMAIL = 'hello@andryore.dev'

/**
 * Which actions follow each reason's reply.
 */
export const GOODBYE_REPLY_ACTIONS: Record<
  GoodbyeReasonId,
  {
    reinstall?: 'button' | 'link'
    github?: 'feature' | 'bug'
    email: boolean
  }
> = {
  'didnt-recognize': { reinstall: 'button', email: false },
  permissions: { reinstall: 'button', email: false },
  'one-time': { reinstall: 'link', email: false },
  'missing-feature': { github: 'feature', email: true },
  bug: { github: 'bug', email: true },
  switched: { email: true },
  other: { email: true },
}

/**
 * All copy of the Goodbye page for one locale.
 */
export interface GoodbyeCopy {
  meta: { title: string; description: string }
  notice: { title: string; body: string }
  headline: string
  lead: string
  question: string
  reasons: Record<GoodbyeReasonId, string>
  replies: Record<GoodbyeReasonId, string>
  replyLabel: string
  reinstall: string
  featureLink: string
  bugLink: string
  emailLead: string
  disclosure: {
    template: string
    yes: string
    no: string
    notProvided: string
    privacyLink: string
  }
}

/**
 * English Goodbye copy. The disclosure template carries `{version}`,
 * `{language}` and `{backups}` tokens that the page replaces with emphasized
 * values.
 */
export const GOODBYE_COPY_EN: GoodbyeCopy = {
  meta: {
    title: 'Goodbye | Snug',
    description: 'Thanks for trying Snug. Tell us why you left, if you like.',
  },
  notice: {
    title: 'Your scheduled backups have stopped',
    body: "Files already saved stay in your folder. Snug's internal safety snapshots were removed with the extension.",
  },
  headline: 'Sorry to see you go',
  lead: 'Your bookmarks were never touched. If you have a minute, one click tells us what went wrong.',
  question: 'Why did you remove Snug?',
  reasons: {
    'didnt-recognize': "I didn't recognize it (new name or icon)",
    permissions: 'It asked for new permissions or got disabled',
    'one-time': 'I only needed it once',
    'missing-feature': 'It was missing a feature',
    bug: "Something didn't work",
    switched: 'I switched to another tool',
    other: 'Other',
  },
  replies: {
    'didnt-recognize':
      'Snug, formerly Bookmarks Import & Export, is the same extension with a new name and icon. Your bookmarks were never touched.',
    permissions:
      'Snug asks to save backups to Downloads and to notify you if one fails. Both are optional now and everything stays on your device.',
    'one-time': 'Your files are yours. Come back anytime.',
    'missing-feature':
      'Thanks for telling us. Describe the feature you need and we will read it.',
    bug: 'Sorry about that. A short report with the steps helps us fix it.',
    switched: 'Thanks for telling us. We wish you well with it.',
    other: 'Thanks for telling us. Write to us if you want to say more.',
  },
  replyLabel: 'Our reply',
  reinstall: 'Reinstall Snug',
  featureLink: 'Request a feature on GitHub',
  bugLink: 'Report a bug on GitHub',
  emailLead: 'Or write to',
  disclosure: {
    template:
      'This page received only: version {version}, language {language}, scheduled backups {backups}. No identifier. Umami counts this visit and the reason you pick, without cookies.',
    yes: 'yes',
    no: 'no',
    notProvided: 'not provided',
    privacyLink: 'Privacy policy',
  },
}

/**
 * Translated Goodbye copy by locale. A locale missing here shows English.
 */
const TRANSLATIONS: Partial<Record<Locale, GoodbyeCopy>> = {
  de: {
    meta: {
      title: 'Auf Wiedersehen | Snug',
      description:
        'Danke, dass du Snug ausprobiert hast. Sag uns gern, warum du gegangen bist.',
    },
    notice: {
      title: 'Deine geplanten Backups sind gestoppt',
      body: 'Bereits gespeicherte Dateien bleiben in deinem Ordner. Die internen Sicherheits-Snapshots von Snug wurden mit der Erweiterung entfernt.',
    },
    headline: 'Schade, dass du gehst',
    lead: 'Deine Lesezeichen wurden nie angerührt. Wenn du kurz Zeit hast, verrät uns ein Klick, was schiefgelaufen ist.',
    question: 'Warum hast du Snug entfernt?',
    reasons: {
      'didnt-recognize': 'Ich habe es nicht erkannt (neuer Name oder Icon)',
      permissions: 'Es wollte neue Berechtigungen oder wurde deaktiviert',
      'one-time': 'Ich brauchte es nur einmal',
      'missing-feature': 'Es fehlte eine Funktion',
      bug: 'Etwas hat nicht funktioniert',
      switched: 'Ich bin zu einem anderen Tool gewechselt',
      other: 'Sonstiges',
    },
    replies: {
      'didnt-recognize':
        'Snug, früher Bookmarks Import & Export, ist dieselbe Erweiterung mit neuem Namen und Icon. Deine Lesezeichen wurden nie angerührt.',
      permissions:
        'Snug bittet darum, Backups in Downloads zu speichern und dich zu benachrichtigen, wenn eines fehlschlägt. Beides ist jetzt optional, und alles bleibt auf deinem Gerät.',
      'one-time': 'Deine Dateien gehören dir. Komm jederzeit zurück.',
      'missing-feature':
        'Danke für den Hinweis. Beschreibe die Funktion, die du brauchst, wir lesen es.',
      bug: 'Das tut uns leid. Ein kurzer Bericht mit den Schritten hilft uns beim Beheben.',
      switched: 'Danke für den Hinweis. Wir wünschen dir viel Erfolg damit.',
      other: 'Danke für den Hinweis. Schreib uns, wenn du mehr sagen möchtest.',
    },
    replyLabel: 'Unsere Antwort',
    reinstall: 'Snug neu installieren',
    featureLink: 'Funktion auf GitHub vorschlagen',
    bugLink: 'Fehler auf GitHub melden',
    emailLead: 'Oder schreib an',
    disclosure: {
      template:
        'Diese Seite hat nur erhalten: Version {version}, Sprache {language}, geplante Backups {backups}. Keine Kennung. Umami zählt diesen Besuch und den gewählten Grund, ohne Cookies.',
      yes: 'ja',
      no: 'nein',
      notProvided: 'nicht angegeben',
      privacyLink: 'Datenschutzerklärung',
    },
  },
  es: {
    meta: {
      title: 'Adiós | Snug',
      description:
        'Gracias por probar Snug. Cuéntanos por qué te fuiste, si quieres.',
    },
    notice: {
      title: 'Tus copias de seguridad programadas se detuvieron',
      body: 'Los archivos ya guardados permanecen en tu carpeta. Las instantáneas de seguridad internas de Snug se eliminaron junto con la extensión.',
    },
    headline: 'Lamentamos que te vayas',
    lead: 'Tus marcadores nunca se tocaron. Si tienes un minuto, un clic nos dice qué salió mal.',
    question: '¿Por qué quitaste Snug?',
    reasons: {
      'didnt-recognize': 'No la reconocí (nuevo nombre o icono)',
      permissions: 'Pidió permisos nuevos o se desactivó',
      'one-time': 'Solo la necesitaba una vez',
      'missing-feature': 'Le faltaba una función',
      bug: 'Algo no funcionó',
      switched: 'Cambié a otra herramienta',
      other: 'Otro',
    },
    replies: {
      'didnt-recognize':
        'Snug, antes Bookmarks Import & Export, es la misma extensión con un nuevo nombre e icono. Tus marcadores nunca se tocaron.',
      permissions:
        'Snug pide guardar copias en Descargas y avisarte si una falla. Ambos permisos ahora son opcionales y todo permanece en tu dispositivo.',
      'one-time': 'Tus archivos son tuyos. Vuelve cuando quieras.',
      'missing-feature':
        'Gracias por avisarnos. Describe la función que necesitas y la leeremos.',
      bug: 'Lamentamos eso. Un reporte breve con los pasos nos ayuda a corregirlo.',
      switched: 'Gracias por avisarnos. Te deseamos lo mejor con ella.',
      other: 'Gracias por avisarnos. Escríbenos si quieres contarnos más.',
    },
    replyLabel: 'Nuestra respuesta',
    reinstall: 'Reinstalar Snug',
    featureLink: 'Solicitar una función en GitHub',
    bugLink: 'Reportar un error en GitHub',
    emailLead: 'O escribe a',
    disclosure: {
      template:
        'Esta página recibió solo: versión {version}, idioma {language}, copias programadas {backups}. Ningún identificador. Umami cuenta esta visita y el motivo que elijas, sin cookies.',
      yes: 'sí',
      no: 'no',
      notProvided: 'no indicado',
      privacyLink: 'Política de privacidad',
    },
  },
  fr: {
    meta: {
      title: 'Au revoir | Snug',
      description:
        'Merci d’avoir essayé Snug. Dites-nous pourquoi vous partez, si vous le souhaitez.',
    },
    notice: {
      title: 'Vos sauvegardes planifiées se sont arrêtées',
      body: 'Les fichiers déjà enregistrés restent dans votre dossier. Les instantanés de sécurité internes de Snug ont été supprimés avec l’extension.',
    },
    headline: 'Désolé de vous voir partir',
    lead: 'Vos favoris n’ont jamais été touchés. Si vous avez une minute, un clic nous dit ce qui n’a pas fonctionné.',
    question: 'Pourquoi avez-vous supprimé Snug ?',
    reasons: {
      'didnt-recognize': 'Je ne l’ai pas reconnue (nouveau nom ou icône)',
      permissions:
        'Elle demandait de nouvelles autorisations ou a été désactivée',
      'one-time': 'Je n’en avais besoin qu’une fois',
      'missing-feature': 'Il lui manquait une fonction',
      bug: 'Quelque chose ne marchait pas',
      switched: 'Je suis passé à un autre outil',
      other: 'Autre',
    },
    replies: {
      'didnt-recognize':
        'Snug, anciennement Bookmarks Import & Export, est la même extension avec un nouveau nom et une nouvelle icône. Vos favoris n’ont jamais été touchés.',
      permissions:
        'Snug demande à enregistrer les sauvegardes dans Téléchargements et à vous prévenir en cas d’échec. Les deux sont désormais facultatifs et tout reste sur votre appareil.',
      'one-time': 'Vos fichiers vous appartiennent. Revenez quand vous voulez.',
      'missing-feature':
        'Merci de nous le dire. Décrivez la fonction dont vous avez besoin, nous la lirons.',
      bug: 'Désolé pour cela. Un court rapport avec les étapes nous aide à corriger.',
      switched:
        'Merci de nous le dire. Nous vous souhaitons le meilleur avec lui.',
      other: 'Merci de nous le dire. Écrivez-nous si vous voulez en dire plus.',
    },
    replyLabel: 'Notre réponse',
    reinstall: 'Réinstaller Snug',
    featureLink: 'Demander une fonction sur GitHub',
    bugLink: 'Signaler un bug sur GitHub',
    emailLead: 'Ou écrivez à',
    disclosure: {
      template:
        'Cette page a reçu uniquement : version {version}, langue {language}, sauvegardes planifiées {backups}. Aucun identifiant. Umami compte cette visite et le motif choisi, sans cookies.',
      yes: 'oui',
      no: 'non',
      notProvided: 'non fourni',
      privacyLink: 'Politique de confidentialité',
    },
  },
  it: {
    meta: {
      title: 'Arrivederci | Snug',
      description:
        'Grazie per aver provato Snug. Se vuoi, dicci perché te ne sei andato.',
    },
    notice: {
      title: 'I tuoi backup programmati si sono fermati',
      body: 'I file già salvati restano nella tua cartella. Gli snapshot di sicurezza interni di Snug sono stati rimossi con l’estensione.',
    },
    headline: 'Ci dispiace vederti andare via',
    lead: 'I tuoi segnalibri non sono mai stati toccati. Se hai un minuto, un clic ci dice cosa è andato storto.',
    question: 'Perché hai rimosso Snug?',
    reasons: {
      'didnt-recognize': 'Non l’ho riconosciuta (nuovo nome o icona)',
      permissions: 'Ha chiesto nuovi permessi o è stata disattivata',
      'one-time': 'Mi serviva solo una volta',
      'missing-feature': 'Mancava una funzione',
      bug: 'Qualcosa non funzionava',
      switched: 'Sono passato a un altro strumento',
      other: 'Altro',
    },
    replies: {
      'didnt-recognize':
        'Snug, prima Bookmarks Import & Export, è la stessa estensione con un nuovo nome e una nuova icona. I tuoi segnalibri non sono mai stati toccati.',
      permissions:
        'Snug chiede di salvare i backup in Download e di avvisarti se uno fallisce. Entrambi ora sono facoltativi e tutto resta sul tuo dispositivo.',
      'one-time': 'I tuoi file sono tuoi. Torna quando vuoi.',
      'missing-feature':
        'Grazie per avercelo detto. Descrivi la funzione che ti serve e la leggeremo.',
      bug: 'Ci dispiace. Una breve segnalazione con i passaggi ci aiuta a risolvere.',
      switched: 'Grazie per avercelo detto. Ti auguriamo il meglio.',
      other: 'Grazie per avercelo detto. Scrivici se vuoi aggiungere altro.',
    },
    replyLabel: 'La nostra risposta',
    reinstall: 'Reinstalla Snug',
    featureLink: 'Richiedi una funzione su GitHub',
    bugLink: 'Segnala un bug su GitHub',
    emailLead: 'Oppure scrivi a',
    disclosure: {
      template:
        'Questa pagina ha ricevuto solo: versione {version}, lingua {language}, backup programmati {backups}. Nessun identificatore. Umami conta questa visita e il motivo scelto, senza cookie.',
      yes: 'sì',
      no: 'no',
      notProvided: 'non fornito',
      privacyLink: 'Informativa sulla privacy',
    },
  },
  pt_BR: {
    meta: {
      title: 'Até logo | Snug',
      description:
        'Obrigado por testar o Snug. Conte por que você saiu, se quiser.',
    },
    notice: {
      title: 'Seus backups agendados foram interrompidos',
      body: 'Os arquivos já salvos continuam na sua pasta. Os snapshots de segurança internos do Snug foram removidos junto com a extensão.',
    },
    headline: 'Que pena ver você partir',
    lead: 'Seus favoritos nunca foram tocados. Se tiver um minuto, um clique nos diz o que deu errado.',
    question: 'Por que você removeu o Snug?',
    reasons: {
      'didnt-recognize': 'Não reconheci (novo nome ou ícone)',
      permissions: 'Pediu novas permissões ou foi desativada',
      'one-time': 'Só precisei uma vez',
      'missing-feature': 'Faltava um recurso',
      bug: 'Algo não funcionou',
      switched: 'Mudei para outra ferramenta',
      other: 'Outro',
    },
    replies: {
      'didnt-recognize':
        'O Snug, antes Bookmarks Import & Export, é a mesma extensão com novo nome e ícone. Seus favoritos nunca foram tocados.',
      permissions:
        'O Snug pede para salvar backups em Downloads e avisar você se um falhar. Ambos agora são opcionais e tudo fica no seu dispositivo.',
      'one-time': 'Seus arquivos são seus. Volte quando quiser.',
      'missing-feature':
        'Obrigado por nos contar. Descreva o recurso de que precisa e nós vamos ler.',
      bug: 'Sentimos muito. Um relato curto com os passos nos ajuda a corrigir.',
      switched: 'Obrigado por nos contar. Desejamos tudo de bom com ela.',
      other: 'Obrigado por nos contar. Escreva para nós se quiser dizer mais.',
    },
    replyLabel: 'Nossa resposta',
    reinstall: 'Reinstalar o Snug',
    featureLink: 'Pedir um recurso no GitHub',
    bugLink: 'Relatar um bug no GitHub',
    emailLead: 'Ou escreva para',
    disclosure: {
      template:
        'Esta página recebeu apenas: versão {version}, idioma {language}, backups agendados {backups}. Nenhum identificador. O Umami conta esta visita e o motivo escolhido, sem cookies.',
      yes: 'sim',
      no: 'não',
      notProvided: 'não informado',
      privacyLink: 'Política de privacidade',
    },
  },
  ru: {
    meta: {
      title: 'До свидания | Snug',
      description:
        'Спасибо, что попробовали Snug. Если хотите, расскажите, почему ушли.',
    },
    notice: {
      title: 'Запланированные бэкапы остановлены',
      body: 'Уже сохранённые файлы остаются в вашей папке. Внутренние страховочные снимки Snug удалены вместе с расширением.',
    },
    headline: 'Жаль, что вы уходите',
    lead: 'Ваши закладки не тронуты. Если есть минута, один клик подскажет нам, что пошло не так.',
    question: 'Почему вы удалили Snug?',
    reasons: {
      'didnt-recognize': 'Не узнал(а) его (новое имя или значок)',
      permissions: 'Запросил новые разрешения или был отключён',
      'one-time': 'Нужен был один раз',
      'missing-feature': 'Не хватало функции',
      bug: 'Что-то не работало',
      switched: 'Перешёл(-ла) на другой инструмент',
      other: 'Другое',
    },
    replies: {
      'didnt-recognize':
        'Snug, раньше Bookmarks Import & Export, это то же расширение с новым именем и значком. Ваши закладки не тронуты.',
      permissions:
        'Snug просит разрешение сохранять бэкапы в «Загрузки» и сообщать о сбое. Оба разрешения теперь необязательны, всё остаётся на вашем устройстве.',
      'one-time': 'Ваши файлы принадлежат вам. Возвращайтесь в любое время.',
      'missing-feature':
        'Спасибо, что сообщили. Опишите нужную функцию, мы прочитаем.',
      bug: 'Простите. Короткий отчёт с шагами поможет нам исправить ошибку.',
      switched: 'Спасибо, что сообщили. Желаем удачи с ним.',
      other: 'Спасибо, что сообщили. Напишите нам, если хотите добавить.',
    },
    replyLabel: 'Наш ответ',
    reinstall: 'Установить Snug снова',
    featureLink: 'Предложить функцию на GitHub',
    bugLink: 'Сообщить об ошибке на GitHub',
    emailLead: 'Или напишите на',
    disclosure: {
      template:
        'Эта страница получила только: версия {version}, язык {language}, бэкапы по расписанию {backups}. Никакого идентификатора. Umami считает этот визит и выбранную причину без файлов cookie.',
      yes: 'да',
      no: 'нет',
      notProvided: 'не указано',
      privacyLink: 'Политика конфиденциальности',
    },
  },
  ja: {
    meta: {
      title: 'さようなら | Snug',
      description:
        'Snugをお試しいただきありがとうございました。よろしければ、削除した理由をお聞かせください。',
    },
    notice: {
      title: 'スケジュールされたバックアップが停止しました',
      body: '保存済みのファイルはフォルダーに残ります。Snugの内部の安全スナップショットは、拡張機能とともに削除されました。',
    },
    headline: 'ご利用ありがとうございました',
    lead: 'ブックマークには一切手を加えていません。お時間があれば、ワンクリックで何が問題だったかお知らせください。',
    question: 'Snugを削除した理由は？',
    reasons: {
      'didnt-recognize': '見覚えがなかった（名前やアイコンが新しい）',
      permissions: '新しい権限を求められた、または無効になった',
      'one-time': '一度だけ使いたかった',
      'missing-feature': '必要な機能がなかった',
      bug: 'うまく動作しなかった',
      switched: '別のツールに乗り換えた',
      other: 'その他',
    },
    replies: {
      'didnt-recognize':
        'SnugはBookmarks Import & Exportの新しい名前とアイコンで、同じ拡張機能です。ブックマークには一切手を加えていません。',
      permissions:
        'Snugはバックアップをダウンロードに保存する権限と、失敗時に通知する権限を求めます。どちらも任意になり、すべてお使いの端末内に保たれます。',
      'one-time': 'ファイルはあなたのものです。いつでもお戻りください。',
      'missing-feature':
        'お知らせありがとうございます。必要な機能を書いていただければ、目を通します。',
      bug: 'ご不便をおかけしました。手順を添えた短い報告をいただけると修正に役立ちます。',
      switched:
        'お知らせありがとうございます。新しいツールでのご活躍をお祈りします。',
      other: 'お知らせありがとうございます。他にもあればご連絡ください。',
    },
    replyLabel: 'こちらからの返信',
    reinstall: 'Snugを再インストール',
    featureLink: 'GitHubで機能をリクエスト',
    bugLink: 'GitHubで不具合を報告',
    emailLead: 'メールはこちら',
    disclosure: {
      template:
        'このページが受け取ったのは次のみです：バージョン {version}、言語 {language}、スケジュールバックアップ {backups}。識別子はありません。Umamiは、Cookieなしでこの訪問と選択された理由を集計します。',
      yes: 'はい',
      no: 'いいえ',
      notProvided: '未提供',
      privacyLink: 'プライバシーポリシー',
    },
  },
  ko: {
    meta: {
      title: '안녕히 가세요 | Snug',
      description:
        'Snug를 사용해 주셔서 감사합니다. 괜찮으시다면 떠나신 이유를 알려 주세요.',
    },
    notice: {
      title: '예약된 백업이 중지되었습니다',
      body: '이미 저장된 파일은 폴더에 그대로 남아 있습니다. Snug의 내부 안전 스냅샷은 확장 프로그램과 함께 삭제되었습니다.',
    },
    headline: '떠나신다니 아쉽습니다',
    lead: '북마크는 전혀 건드리지 않았습니다. 잠시 시간이 되신다면 한 번의 클릭으로 무엇이 문제였는지 알려 주세요.',
    question: 'Snug를 삭제한 이유는 무엇인가요?',
    reasons: {
      'didnt-recognize': '알아보지 못했어요(새 이름 또는 아이콘)',
      permissions: '새 권한을 요구했거나 비활성화되었어요',
      'one-time': '한 번만 필요했어요',
      'missing-feature': '필요한 기능이 없었어요',
      bug: '제대로 작동하지 않았어요',
      switched: '다른 도구로 옮겼어요',
      other: '기타',
    },
    replies: {
      'didnt-recognize':
        'Snug는 이전 이름이 Bookmarks Import & Export인, 이름과 아이콘만 바뀐 같은 확장 프로그램입니다. 북마크는 전혀 건드리지 않았습니다.',
      permissions:
        'Snug는 백업을 다운로드 폴더에 저장하고 실패 시 알려 줄 권한을 요청합니다. 둘 다 이제 선택 사항이며 모든 데이터는 기기에 남습니다.',
      'one-time': '파일은 여러분의 것입니다. 언제든 다시 오세요.',
      'missing-feature':
        '알려 주셔서 감사합니다. 필요한 기능을 적어 주시면 읽어 보겠습니다.',
      bug: '불편을 드려 죄송합니다. 재현 단계를 담은 짧은 보고가 수정에 도움이 됩니다.',
      switched:
        '알려 주셔서 감사합니다. 새 도구와 좋은 시간 보내시길 바랍니다.',
      other: '알려 주셔서 감사합니다. 더 하실 말씀이 있다면 메일 주세요.',
    },
    replyLabel: '저희 답변',
    reinstall: 'Snug 다시 설치',
    featureLink: 'GitHub에서 기능 요청',
    bugLink: 'GitHub에서 버그 신고',
    emailLead: '또는 메일 보내기',
    disclosure: {
      template:
        '이 페이지가 받은 정보는 다음뿐입니다: 버전 {version}, 언어 {language}, 예약 백업 {backups}. 식별자는 없습니다. Umami는 쿠키 없이 이 방문과 선택한 이유만 집계합니다.',
      yes: '예',
      no: '아니요',
      notProvided: '제공되지 않음',
      privacyLink: '개인정보 처리방침',
    },
  },
  zh_CN: {
    meta: {
      title: '再见 | Snug',
      description: '感谢试用 Snug。如果愿意，请告诉我们你离开的原因。',
    },
    notice: {
      title: '你的定时备份已停止',
      body: '已保存的文件仍保留在你的文件夹中。Snug 的内部安全快照已随扩展程序一并删除。',
    },
    headline: '很遗憾你要离开',
    lead: '你的书签从未被改动。如果你有一分钟，点一下就能告诉我们哪里出了问题。',
    question: '你为什么移除了 Snug？',
    reasons: {
      'didnt-recognize': '我没认出它（新名称或图标）',
      permissions: '它请求了新权限或被停用了',
      'one-time': '我只用一次',
      'missing-feature': '缺少某项功能',
      bug: '出了问题',
      switched: '我换了别的工具',
      other: '其他',
    },
    replies: {
      'didnt-recognize':
        'Snug 原名 Bookmarks Import & Export，是同一个扩展程序，只是换了名称和图标。你的书签从未被改动。',
      permissions:
        'Snug 请求将备份保存到“下载”文件夹，并在备份失败时通知你。这两项现在都是可选的，所有数据都保留在你的设备上。',
      'one-time': '你的文件属于你。随时欢迎回来。',
      'missing-feature': '感谢告诉我们。请描述你需要的功能，我们会认真阅读。',
      bug: '抱歉给你带来麻烦。附上操作步骤的简短报告能帮我们修复。',
      switched: '感谢告诉我们。祝你使用愉快。',
      other: '感谢告诉我们。如果还想多说几句，欢迎写信给我们。',
    },
    replyLabel: '我们的回复',
    reinstall: '重新安装 Snug',
    featureLink: '在 GitHub 上提出功能请求',
    bugLink: '在 GitHub 上报告问题',
    emailLead: '或写信至',
    disclosure: {
      template:
        '此页面仅收到：版本 {version}、语言 {language}、定时备份 {backups}。没有任何标识符。Umami 在不使用 Cookie 的情况下统计此次访问和你选择的原因。',
      yes: '是',
      no: '否',
      notProvided: '未提供',
      privacyLink: '隐私政策',
    },
  },
}

/**
 * Goodbye copy for a locale, English when the locale has no translation yet.
 * @param locale - A supported locale code.
 * @returns The locale's copy, or the English copy.
 */
export function getGoodbyeCopy(locale: Locale): GoodbyeCopy {
  return TRANSLATIONS[locale] ?? GOODBYE_COPY_EN
}

/**
 * Site-relative path of the Goodbye page for a locale.
 * @param locale - A supported locale code.
 * @returns `/goodbye/` or `/<locale>/goodbye/`.
 */
export function goodbyePath(locale: Locale): string {
  return localePath(locale, '/goodbye/')
}

/**
 * The values the Goodbye page received in its URL, each `null` when absent or
 * not valid.
 */
export interface GoodbyeParameters {
  version: string | null
  language: Locale | null
  scheduledBackups: boolean | null
}

const VERSION_PATTERN = /^\d{1,4}(?:\.\d{1,4}){0,3}$/

/**
 * Reads `v`, `lang` and `ae` from a query string. Anything that is not a
 * dotted version, a supported locale code or `0`/`1` becomes `null`, so a
 * malformed value is never shown.
 * @param search - A query string such as `location.search`.
 * @returns The validated values.
 */
export function parseGoodbyeParameters(search: string): GoodbyeParameters {
  const parameters = new URLSearchParams(search)
  const version = parameters.get('v')
  const language = parameters.get('lang')
  const backups = parameters.get('ae')
  return {
    version: version !== null && VERSION_PATTERN.test(version) ? version : null,
    language: LOCALES.find((locale) => locale === language) ?? null,
    scheduledBackups: backups === '1' ? true : backups === '0' ? false : null,
  }
}

/**
 * Where a visit to the unprefixed English page should go when its `lang`
 * names another locale. Pages that already carry a locale path stay put.
 * @param locale - The locale of the page being shown.
 * @param search - The page's query string.
 * @returns The locale page URL with the same query, or `null` to stay.
 */
export function goodbyeRedirectTarget(
  locale: Locale,
  search: string,
): string | null {
  if (locale !== DEFAULT_LOCALE) return null
  const { language } = parseGoodbyeParameters(search)
  return language === null || language === DEFAULT_LOCALE
    ? null
    : `${goodbyePath(language)}${search}`
}
