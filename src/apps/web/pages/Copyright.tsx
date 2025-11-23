import { Button } from "@/packages/shared-ui/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Copyright = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-6 py-12">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Direitos Autorais e Propriedade Intelectual</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Natureza do Software</h2>
            <p>
              O AniDock é um software indexador que permite aos usuários organizar metadados 
              publicamente disponíveis sobre animes. <strong>O software não hospeda, armazena, 
              transmite ou distribui qualquer conteúdo protegido por direitos autorais.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. O Que o AniDock Faz</h2>
            <p>O software permite:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Indexar metadados públicos (títulos, descrições, imagens de capa)</li>
              <li>Organizar informações de animes de diversas fontes</li>
              <li>Criar drivers (configurações) para indexar sites diferentes</li>
              <li>Armazenar essas informações localmente no computador do usuário</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. O Que o AniDock NÃO Faz</h2>
            <p>O software NÃO:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Hospeda ou armazena vídeos, episódios ou conteúdo de animes</li>
              <li>Distribui ou compartilha conteúdo protegido por direitos autorais</li>
              <li>Faz download ou cache de vídeos</li>
              <li>Fornece acesso direto a conteúdo pirateado</li>
              <li>Distribui drivers pré-configurados para sites específicos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Responsabilidade do Usuário</h2>
            <p>
              O usuário é o único responsável por:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Respeitar os direitos autorais ao usar o software</li>
              <li>Verificar a legalidade das fontes que indexa</li>
              <li>Cumprir os termos de uso dos sites que acessa</li>
              <li>Garantir que possui direitos ou licenças apropriadas para acessar conteúdo</li>
              <li>Usar o software apenas para fins legais</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Sistema de Drivers</h2>
            <p>
              O AniDock permite que usuários criem "drivers" (configurações de indexação). 
              <strong>Não distribuímos drivers pré-configurados</strong> para evitar facilitar 
              o acesso a conteúdo potencialmente infrator. Drivers criados por usuários são 
              de sua exclusiva responsabilidade.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Isenção de Responsabilidade</h2>
            <p>
              O AniDock é uma ferramenta neutra de indexação. Não endossamos, apoiamos ou 
              facilitamos a violação de direitos autorais. Não somos responsáveis pelo uso 
              indevido do software por terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Propriedade Intelectual do Software</h2>
            <p>
              O código-fonte, design e marca "AniDock" são de propriedade dos desenvolvedores. 
              O software pode ser distribuído sob licença de código aberto (verifique o repositório).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Conformidade com DMCA</h2>
            <p>
              Como não hospedamos conteúdo, não estamos sujeitos a avisos DMCA tradicionais. 
              No entanto, respeitamos os direitos de propriedade intelectual e cooperaremos 
              com autoridades quando necessário.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Reportar Uso Indevido</h2>
            <p>
              Se você acredita que o software está sendo usado de forma a violar direitos 
              autorais, entre em contato conosco através dos canais oficiais de suporte.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Jurisdição</h2>
            <p>
              Esta política está sujeita às leis brasileiras e internacionais de direitos 
              autorais. O uso do software implica na aceitação dessas condições.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contato</h2>
            <p>
              Para questões sobre direitos autorais e propriedade intelectual, entre em contato 
              através do nosso repositório no GitHub ou email de suporte oficial.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Copyright;
