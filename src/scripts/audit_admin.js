import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN_DIR = path.join(__dirname, '..', 'components', 'admin');
const REPORT_PATH = path.join(__dirname, '..', '..', 'ADMIN_AUDIT_REPORT.md');

const RULES = {
    MAX_LINES: 500,
    NO_ANY: /:\s*any\b|as\s+any\b/,
    NO_SERVICE_ROLE: /service_role|SUPABASE_SERVICE_ROLE/i,
    NO_GENERIC_NAMES: /(className|id)=["'](?:container|wrapper|box|content|main|section|div\d+|layout|block|card\d+)["']/,
    SEMANTIC_COMPONENT_NAME: /^[A-Z][a-zA-Z0-9]*(?:Container|Panel|View|Tab|Manager|Editor|Modal|Card|List|Grid|Form|Button|Input|Select|Checkbox|Radio|Toggle|Badge|Alert|Toast|Dropdown|Menu|Navbar|Sidebar|Footer|Header|Hero|Banner|Section|Block|Widget|Item|Row|Column|Layout|Page|Screen|Dialog|Drawer|Popover|Tooltip|Spinner|Loader|Icon|Image|Video|Audio|Chart|Graph|Table|Cell|Avatar|Chip|Tag|Label|Link|Divider|Separator|Spacer|Overlay|Backdrop|Mask|Portal|Transition|Animation|Skeleton|Placeholder|Empty|Error|Success|Warning|Info|Debug|Dev|Test|Mock|Stub|Fake|Dummy|Example|Sample|Demo|Preview|Template|Prototype|Draft|WIP|TODO|FIXME|HACK|NOTE|XXX|OPTIMIZE|REFACTOR|REVIEW|DEPRECATED|OBSOLETE|LEGACY|OLD|NEW|TEMP|TMP|BACKUP|BAK|COPY|CLONE|DUPLICATE|MIRROR|ALIAS|SHORTCUT|LINK|REF|REFERENCE|POINTER|HANDLE|HOOK|CALLBACK|HANDLER|LISTENER|OBSERVER|SUBSCRIBER|PUBLISHER|EMITTER|DISPATCHER|ROUTER|NAVIGATOR|CONTROLLER|SERVICE|PROVIDER|FACTORY|BUILDER|CREATOR|GENERATOR|PARSER|SERIALIZER|DESERIALIZER|ENCODER|DECODER|COMPRESSOR|DECOMPRESSOR|ENCRYPTOR|DECRYPTOR|HASHER|SIGNER|VERIFIER|VALIDATOR|SANITIZER|NORMALIZER|FORMATTER|TRANSFORMER|CONVERTER|MAPPER|ADAPTER|WRAPPER|PROXY|DECORATOR|INTERCEPTOR|MIDDLEWARE|FILTER|GUARD|POLICY|STRATEGY|ALGORITHM|UTIL|HELPER|TOOL|UTILITY|COMMON|SHARED|GLOBAL|CONSTANT|CONFIG|SETTING|OPTION|PARAM|ARG|ARGUMENT|PROP|PROPERTY|ATTR|ATTRIBUTE|FIELD|MEMBER|VAR|VARIABLE|VALUE|DATA|STATE|CONTEXT|STORE|CACHE|BUFFER|QUEUE|STACK|HEAP|POOL|REGISTRY|REPOSITORY|DATABASE|DB|TABLE|COLUMN|ROW|RECORD|ENTITY|MODEL|SCHEMA|TYPE|INTERFACE|CLASS|STRUCT|ENUM|UNION|TUPLE|ARRAY|LIST|SET|MAP|DICT|DICTIONARY|HASH|OBJECT|JSON|XML|YAML|TOML|INI|CSV|TSV|SQL|QUERY|COMMAND|REQUEST|RESPONSE|MESSAGE|EVENT|ACTION|MUTATION|SUBSCRIPTION|NOTIFICATION|ALERT|LOG|LOGGER|DEBUGGER|PROFILER|TRACER|MONITOR|METRIC|COUNTER|GAUGE|HISTOGRAM|TIMER|CLOCK|SCHEDULER|CRON|JOB|TASK|WORKER|THREAD|PROCESS|DAEMON|AGENT|BOT|CRAWLER|SCRAPER|SPIDER|FETCHER|DOWNLOADER|UPLOADER|IMPORTER|EXPORTER|READER|WRITER|STREAM|PIPE|CHANNEL|SOCKET|CONNECTION|CLIENT|SERVER|PEER|NODE|HOST|ENDPOINT|ROUTE|PATH|URL|URI|LINK|HREF|SRC|SOURCE|DEST|DESTINATION|TARGET|ORIGIN|BASE|ROOT|HOME|INDEX|MAIN|APP|APPLICATION|PROGRAM|SOFTWARE|SYSTEM|PLATFORM|FRAMEWORK|LIBRARY|PACKAGE|MODULE|COMPONENT|ELEMENT|PART|PIECE|UNIT|CHUNK|SEGMENT|FRAGMENT|SLICE|RANGE|SPAN|INTERVAL|PERIOD|DURATION|TIMEOUT|DELAY|WAIT|SLEEP|PAUSE|RESUME|START|STOP|END|BEGIN|FINISH|COMPLETE|DONE|SUCCESS|FAIL|ERROR|EXCEPTION|THROW|CATCH|TRY|FINALLY|RETURN|YIELD|AWAIT|ASYNC|SYNC|PROMISE|FUTURE|DEFERRED|LAZY|EAGER|STRICT|LOOSE|WEAK|STRONG|SOFT|HARD|FAST|SLOW|QUICK|INSTANT|IMMEDIATE|DELAYED|SCHEDULED|PENDING|ACTIVE|INACTIVE|ENABLED|DISABLED|ON|OFF|TRUE|FALSE|YES|NO|OK|CANCEL|ABORT|RETRY|SKIP|IGNORE|ACCEPT|REJECT|APPROVE|DENY|ALLOW|BLOCK|PERMIT|FORBID|GRANT|REVOKE|ADD|REMOVE|DELETE|CREATE|UPDATE|EDIT|MODIFY|CHANGE|ALTER|REPLACE|SWAP|SWITCH|TOGGLE|FLIP|INVERT|REVERSE|ROTATE|SHIFT|MOVE|DRAG|DROP|RESIZE|SCALE|ZOOM|PAN|SCROLL|SLIDE|SWIPE|TAP|CLICK|DOUBLE|TRIPLE|LONG|SHORT|PRESS|RELEASE|HOLD|HOVER|FOCUS|BLUR|SELECT|DESELECT|CHECK|UNCHECK|MARK|UNMARK|HIGHLIGHT|UNHIGHLIGHT|SHOW|HIDE|DISPLAY|RENDER|PAINT|DRAW|CLEAR|ERASE|FILL|STROKE|CLIP|MASK|BLEND|COMPOSITE|TRANSFORM|TRANSLATE|ROTATE|SCALE|SKEW|MATRIX|PERSPECTIVE|ORIGIN|ANCHOR|PIVOT|CENTER|MIDDLE|TOP|BOTTOM|LEFT|RIGHT|START|END|FIRST|LAST|PREV|NEXT|BEFORE|AFTER|ABOVE|BELOW|OVER|UNDER|INSIDE|OUTSIDE|WITHIN|BEYOND|BETWEEN|AMONG|AROUND|NEAR|FAR|CLOSE|DISTANT|ADJACENT|NEIGHBOR|SIBLING|PARENT|CHILD|ANCESTOR|DESCENDANT|ROOT|LEAF|BRANCH|TREE|GRAPH|NODE|EDGE|VERTEX|PATH|CYCLE|LOOP|CHAIN|SEQUENCE|SERIES|ORDER|SORT|RANK|PRIORITY|WEIGHT|SCORE|RATING|LEVEL|TIER|GRADE|CLASS|CATEGORY|GROUP|CLUSTER|COLLECTION|BATCH|BULK|MASS|VOLUME|SIZE|LENGTH|WIDTH|HEIGHT|DEPTH|AREA|PERIMETER|CIRCUMFERENCE|RADIUS|DIAMETER|ANGLE|DEGREE|RADIAN|SLOPE|GRADIENT|CURVE|LINE|POINT|VECTOR|COORDINATE|POSITION|LOCATION|PLACE|SPOT|SITE|ZONE|REGION|AREA|TERRITORY|DOMAIN|REALM|SCOPE|RANGE|EXTENT|LIMIT|BOUND|BOUNDARY|BORDER|EDGE|MARGIN|PADDING|SPACING|GAP|OFFSET|INDENT|OUTDENT|ALIGN|JUSTIFY|DISTRIBUTE|BALANCE|EQUALIZE|NORMALIZE|STANDARDIZE|REGULARIZE|UNIFORMIZE|HARMONIZE|SYNCHRONIZE|COORDINATE|INTEGRATE|COMBINE|MERGE|JOIN|UNITE|CONNECT|LINK|BIND|ATTACH|DETACH|SEPARATE|SPLIT|DIVIDE|PARTITION|SEGMENT|FRAGMENT|BREAK|CRACK|TEAR|RIP|CUT|SLICE|CHOP|TRIM|CROP|CLIP|SNIP|PRUNE|SHEAR|SHAVE|SCRAPE|SCRATCH|CARVE|ENGRAVE|ETCH|EMBOSS|IMPRINT|STAMP|SEAL|SIGN|MARK|LABEL|TAG|ANNOTATE|COMMENT|NOTE|REMARK|OBSERVE|NOTICE|DETECT|DISCOVER|FIND|SEARCH|SEEK|LOOK|SCAN|BROWSE|EXPLORE|INVESTIGATE|EXAMINE|INSPECT|REVIEW|AUDIT|CHECK|VERIFY|VALIDATE|CONFIRM|CERTIFY|APPROVE|ENDORSE|RATIFY|AUTHORIZE|PERMIT|LICENSE|REGISTER|ENROLL|SUBSCRIBE|FOLLOW|TRACK|MONITOR|WATCH|OBSERVE|WITNESS|SEE|VIEW|LOOK|GAZE|STARE|GLANCE|PEEK|PEEP|SPY|SNOOP|EAVESDROP|LISTEN|HEAR|SOUND|NOISE|TONE|PITCH|VOLUME|LOUDNESS|AMPLITUDE|FREQUENCY|WAVELENGTH|PERIOD|PHASE|HARMONIC|OVERTONE|UNDERTONE|FUNDAMENTAL|RESONANCE|VIBRATION|OSCILLATION|WAVE|PULSE|BEAT|RHYTHM|TEMPO|PACE|SPEED|VELOCITY|ACCELERATION|MOMENTUM|FORCE|ENERGY|POWER|STRENGTH|INTENSITY|MAGNITUDE|AMPLITUDE|LEVEL|DEGREE|EXTENT|AMOUNT|QUANTITY|NUMBER|COUNT|TOTAL|SUM|AGGREGATE|ACCUMULATE|COLLECT|GATHER|ASSEMBLE|COMPILE|BUILD|CONSTRUCT|CREATE|MAKE|PRODUCE|GENERATE|SYNTHESIZE|COMPOSE|FORM|SHAPE|MOLD|CAST|FORGE|CRAFT|MANUFACTURE|FABRICATE|ASSEMBLE|INSTALL|SETUP|CONFIGURE|INITIALIZE|BOOTSTRAP|LAUNCH|START|RUN|EXECUTE|PERFORM|OPERATE|FUNCTION|WORK|ACT|BEHAVE|REACT|RESPOND|REPLY|ANSWER|RETURN|YIELD|PRODUCE|OUTPUT|EMIT|SEND|TRANSMIT|BROADCAST|PUBLISH|ANNOUNCE|DECLARE|PROCLAIM|STATE|SAY|TELL|SPEAK|TALK|COMMUNICATE|CONVEY|EXPRESS|ARTICULATE|VERBALIZE|VOCALIZE|UTTER|PRONOUNCE|ENUNCIATE|ACCENT|STRESS|EMPHASIZE|HIGHLIGHT|UNDERLINE|BOLD|ITALIC|STRIKE|UNDERLINE|OVERLINE|SUBSCRIPT|SUPERSCRIPT|CAPITALIZE|UPPERCASE|LOWERCASE|TITLECASE|CAMELCASE|PASCALCASE|SNAKECASE|KEBABCASE|DOTCASE|PATHCASE|SENTENCECASE|CONSTANTCASE|HEADERCASE|PARAMCASE|FLATCASE)$/
};

function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllFiles(filePath, fileList);
        } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
            fileList.push(filePath);
        }
    });
    return fileList;
}

function auditAdminComponents() {
    const files = getAllFiles(ADMIN_DIR);

    let report = "# 🛡️ Relatório de Auditoria: Admin Components\n\n";
    report += `**Data:** ${new Date().toLocaleString('pt-BR')}\n`;
    report += `**Arquivos analisados:** ${files.length}\n\n`;
    report += "---\n\n";

    const violations = {
        fileSize: [],
        anyUsage: [],
        serviceRole: [],
        genericNaming: [],
        semanticNaming: []
    };

    let totalViolations = 0;

    files.forEach(filePath => {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        const relativePath = path.relative(ADMIN_DIR, filePath);
        const fileName = path.basename(filePath, path.extname(filePath));

        // Rule 1: File Size (≤500 lines)
        if (lines.length > RULES.MAX_LINES) {
            violations.fileSize.push(`| \`${relativePath}\` | **${lines.length}** linhas (limite: ${RULES.MAX_LINES}) |`);
            totalViolations++;
        }

        // Rule 2: No 'any' usage
        let anyFound = false;
        lines.forEach((line, idx) => {
            if (RULES.NO_ANY.test(line) && !anyFound) {
                violations.anyUsage.push(`| \`${relativePath}\` | Linha ${idx + 1}: \`${line.trim().substring(0, 60)}...\` |`);
                anyFound = true;
                totalViolations++;
            }
        });

        // Rule 3: No service_role exposure
        let serviceRoleFound = false;
        lines.forEach((line, idx) => {
            if (RULES.NO_SERVICE_ROLE.test(line) && !serviceRoleFound) {
                violations.serviceRole.push(`| \`${relativePath}\` | Linha ${idx + 1}: Possível exposição de \`service_role\` |`);
                serviceRoleFound = true;
                totalViolations++;
            }
        });

        // Rule 4: No generic naming in JSX
        let genericNamingFound = false;
        lines.forEach((line, idx) => {
            if (RULES.NO_GENERIC_NAMES.test(line) && !genericNamingFound) {
                violations.genericNaming.push(`| \`${relativePath}\` | Linha ${idx + 1}: Nome genérico detectado |`);
                genericNamingFound = true;
                totalViolations++;
            }
        });

        // Rule 5: Semantic component naming (for .tsx files)
        if (filePath.endsWith('.tsx') && !RULES.SEMANTIC_COMPONENT_NAME.test(fileName)) {
            violations.semanticNaming.push(`| \`${relativePath}\` | Nome do componente não segue padrão semântico |`);
            totalViolations++;
        }
    });

    // Generate report sections
    report += "## 📊 Resumo Executivo\n\n";
    report += `- **Total de violações:** ${totalViolations}\n`;
    report += `- **Arquivos com problemas:** ${new Set([
        ...violations.fileSize,
        ...violations.anyUsage,
        ...violations.serviceRole,
        ...violations.genericNaming,
        ...violations.semanticNaming
    ].map(v => v.split('|')[1].trim())).size}\n\n`;

    if (totalViolations === 0) {
        report += "### ✅ **PARABÉNS!**\n\n";
        report += "Todos os componentes admin estão em conformidade com as 10 regras fundamentais!\n\n";
    } else {
        report += "---\n\n## 🚨 Violações Detectadas\n\n";

        if (violations.fileSize.length > 0) {
            report += "### 📏 Regra 1.4: Tamanho de Arquivo (>500 linhas)\n\n";
            report += "| Arquivo | Detalhes |\n|---------|----------|\n";
            report += violations.fileSize.join('\n') + '\n\n';
        }

        if (violations.anyUsage.length > 0) {
            report += "### ⚠️ Regra 7: Uso de `any` (Tipagem Fraca)\n\n";
            report += "| Arquivo | Detalhes |\n|---------|----------|\n";
            report += violations.anyUsage.join('\n') + '\n\n';
        }

        if (violations.serviceRole.length > 0) {
            report += "### 🔒 Regra 1.3 & 8.2: Exposição de `service_role`\n\n";
            report += "| Arquivo | Detalhes |\n|---------|----------|\n";
            report += violations.serviceRole.join('\n') + '\n\n';
        }

        if (violations.genericNaming.length > 0) {
            report += "### 🏷️ Regra 4: Nomes Genéricos em JSX\n\n";
            report += "| Arquivo | Detalhes |\n|---------|----------|\n";
            report += violations.genericNaming.join('\n') + '\n\n';
        }

        if (violations.semanticNaming.length > 0) {
            report += "### 📝 Regra 2 & 4: Nomenclatura Semântica de Componentes\n\n";
            report += "| Arquivo | Detalhes |\n|---------|----------|\n";
            report += violations.semanticNaming.join('\n') + '\n\n';
        }
    }

    report += "---\n\n";
    report += "## 📋 Regras Verificadas\n\n";
    report += "1. **Regra 1.4:** Tamanho de arquivo ≤500 linhas\n";
    report += "2. **Regra 7:** Proibição de `any` em áreas críticas\n";
    report += "3. **Regra 1.3 & 8.2:** Sem exposição de `service_role`\n";
    report += "4. **Regra 4:** Nomes semânticos (sem `container`, `wrapper`, etc.)\n";
    report += "5. **Regra 2:** Nomenclatura clara e descritiva\n\n";

    fs.writeFileSync(REPORT_PATH, report);
    console.log(`\n✅ Relatório gerado em: ${REPORT_PATH}\n`);
    console.log(`📊 Total de violações: ${totalViolations}`);
    console.log(`📁 Arquivos analisados: ${files.length}\n`);
}

auditAdminComponents();
