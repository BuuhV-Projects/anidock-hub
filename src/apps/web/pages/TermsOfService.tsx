import { Button } from "@/packages/shared-ui/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-6 py-12">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Termos de Uso</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Aceitação dos Termos</h2>
            <p>
              Ao baixar, instalar ou usar o AniDock, você concorda com estes Termos de Uso. 
              Se você não concorda com estes termos, não use o software.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Descrição do Serviço</h2>
            <p>
              O AniDock é um software desktop que permite indexar e organizar metadados de animes 
              de diversas fontes na internet. O software roda localmente no computador do usuário.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Uso Aceitável</h2>
            <p>Você concorda em:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Usar o software apenas para fins legais</li>
              <li>Não violar direitos autorais de terceiros</li>
              <li>Não usar o software para distribuir conteúdo ilegal</li>
              <li>Respeitar os termos de uso dos sites que você indexa</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Propriedade Intelectual</h2>
            <p>
              O AniDock não hospeda, armazena ou distribui conteúdo protegido por direitos autorais. 
              O software apenas indexa metadados publicamente disponíveis. O usuário é responsável 
              pelo uso que faz das informações indexadas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Isenção de Garantias</h2>
            <p>
              O software é fornecido "como está", sem garantias de qualquer tipo. Não garantimos 
              que o software será livre de erros ou funcionará sem interrupções.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Limitação de Responsabilidade</h2>
            <p>
              Em nenhuma circunstância seremos responsáveis por danos diretos, indiretos, 
              incidentais ou consequenciais decorrentes do uso ou impossibilidade de usar o software.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Modificações</h2>
            <p>
              Reservamos o direito de modificar estes termos a qualquer momento. Alterações 
              entrarão em vigor imediatamente após a publicação.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Contato</h2>
            <p>
              Para questões sobre estes Termos de Uso, entre em contato através do nosso 
              repositório no GitHub ou email de suporte.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
