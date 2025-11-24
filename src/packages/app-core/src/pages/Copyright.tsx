import { Button } from '@anidock/shared-ui';
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Copyright = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <h1 className="text-4xl font-display font-bold mb-8">Política de Direitos Autorais</h1>
        
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Declaração Importante</h2>
            <p className="font-semibold text-foreground">
              O AniDock NÃO hospeda, armazena, distribui, transmite ou disponibiliza qualquer conteúdo protegido 
              por direitos autorais, incluindo vídeos, episódios de anime ou qualquer material audiovisual.
            </p>
            <p className="mt-4">
              O AniDock é exclusivamente uma ferramenta de organização e indexação de informações públicas 
              disponíveis na internet. O software armazena APENAS metadados (títulos, sinopses, imagens de capa) 
              e links para sites de terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Natureza do Serviço</h2>
            <p>
              O AniDock funciona como:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Um organizador de bookmarks/favoritos</li>
              <li>Um indexador de informações públicas</li>
              <li>Uma ferramenta de catalogação pessoal</li>
            </ul>
            <p className="mt-4">
              Similar a um gerenciador de favoritos de navegador ou aplicativo de notas, o AniDock apenas 
              organiza informações que os usuários escolhem salvar localmente em seus próprios dispositivos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Responsabilidade do Usuário</h2>
            <p>
              Ao utilizar o AniDock, você reconhece e concorda que:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>É TOTALMENTE responsável pelo conteúdo que escolhe indexar</li>
              <li>Deve respeitar direitos autorais e propriedade intelectual</li>
              <li>Deve verificar a legalidade dos sites que escolher acessar</li>
              <li>Não deve usar o software para facilitar ou promover pirataria</li>
              <li>Deve cumprir as leis de direitos autorais aplicáveis em sua jurisdição</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Isenção de Responsabilidade</h2>
            <p>
              O AniDock e seus desenvolvedores NÃO são responsáveis por:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Conteúdo disponibilizado por sites de terceiros</li>
              <li>Legalidade de sites indexados pelos usuários</li>
              <li>Violações de direitos autorais cometidas por usuários</li>
              <li>Uso indevido ou ilegal do software</li>
              <li>Disponibilidade ou precisão de conteúdo de terceiros</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Política Anti-Pirataria</h2>
            <p>
              O AniDock não endossa, promove ou facilita a pirataria. Nosso software é uma ferramenta neutra 
              de organização pessoal. Assim como fabricantes de computadores não são responsáveis pelo que 
              usuários fazem com seus dispositivos, não controlamos como os usuários utilizam nossa ferramenta.
            </p>
            <p className="mt-4">
              <strong>Uso Legítimo Pretendido:</strong> O AniDock foi projetado para organizar informações de 
              serviços legais de streaming, catálogos oficiais e conteúdo legal disponível publicamente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Não Distribuímos Plugins/Drivers</h2>
            <p>
              Para manter nossa proteção legal:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>O AniDock NÃO fornece ou distribui drivers/plugins pré-configurados para sites</li>
              <li>Usuários criam seus próprios drivers para os sites que ELES escolhem</li>
              <li>A IA pode auxiliar na criação, mas o usuário é responsável por sua escolha</li>
              <li>Compartilhamento de drivers ocorre diretamente entre usuários, não através de nós</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. DMCA e Notificações de Remoção</h2>
            <p>
              Embora não hospedemos conteúdo, respeitamos direitos de propriedade intelectual. 
              Se você acredita que:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Seu conteúdo protegido está sendo usado indevidamente através do AniDock</li>
              <li>O software facilita violação de seus direitos autorais</li>
            </ul>
            <p className="mt-4">
              Entre em contato conosco com:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Identificação clara da obra protegida</li>
              <li>Descrição de como acredita que está sendo violada</li>
              <li>Suas informações de contato</li>
              <li>Declaração de boa-fé</li>
              <li>Declaração de precisão sob pena de perjúrio</li>
              <li>Assinatura física ou eletrônica</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Proteção de Direitos Autorais do Software</h2>
            <p>
              O próprio software AniDock (código, interface, design, documentação) é protegido por direitos autorais:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>© 2024 AniDock. Todos os direitos reservados.</li>
              <li>Distribuição não autorizada do software é proibida</li>
              <li>Modificação do código sem permissão é proibida</li>
              <li>Engenharia reversa é proibida, exceto quando permitido por lei</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Marcas Registradas</h2>
            <p>
              "AniDock" e logos relacionados são marcas registradas ou marcas comerciais. Uso não autorizado é proibido.
            </p>
            <p className="mt-4">
              Menções a animes, estúdios, distribuidoras ou outras marcas são apenas para fins de identificação 
              e pertencem aos seus respectivos proprietários. Não reivindicamos nenhum direito sobre essas marcas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Conteúdo de Terceiros</h2>
            <p>
              Todo conteúdo de terceiros (imagens, sinopses, títulos) indexado pelo usuário permanece propriedade 
              de seus respectivos detentores de direitos. O AniDock não reivindica propriedade sobre tal conteúdo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Fair Use / Uso Justo</h2>
            <p>
              Acreditamos que a organização pessoal de informações públicas para fins de catalogação e referência 
              constitui uso justo (fair use) sob as leis de direitos autorais aplicáveis. No entanto, não fornecemos 
              aconselhamento jurídico e cada usuário deve consultar suas próprias leis locais.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Modificações desta Política</h2>
            <p>
              Reservamos o direito de modificar esta política a qualquer momento. Usuários serão notificados 
              sobre mudanças significativas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">13. Jurisdição e Lei Aplicável</h2>
            <p>
              Esta política é regida pelas leis brasileiras, incluindo mas não limitado à Lei nº 9.610/98 
              (Lei de Direitos Autorais). Disputas serão resolvidas nos tribunais brasileiros competentes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">14. Contato para Questões de Direitos Autorais</h2>
            <p>
              Para notificações DMCA ou questões sobre direitos autorais, entre em contato através dos 
              canais oficiais disponíveis em nosso site.
            </p>
          </section>

          <div className="bg-card p-6 rounded-lg border border-border mt-8">
            <p className="font-semibold text-foreground mb-2">Resumo para Usuários:</p>
            <p>
              Use o AniDock de forma responsável e legal. Organize apenas conteúdo que você tem direito de acessar. 
              Não use para pirataria. Respeite direitos autorais. Você é responsável por suas escolhas.
            </p>
          </div>

          <p className="text-sm mt-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Copyright;
