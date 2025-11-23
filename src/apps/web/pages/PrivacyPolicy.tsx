import { Button } from "@/packages/shared-ui/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-6 py-12">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Política de Privacidade</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Informações Gerais</h2>
            <p>
              Esta Política de Privacidade descreve como o AniDock coleta, usa e protege 
              suas informações pessoais.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Dados Coletados</h2>
            <p>
              O AniDock é um software desktop que funciona localmente. Por padrão, não coletamos 
              dados pessoais dos usuários. Todos os dados ficam armazenados localmente no seu computador.
            </p>
            <p className="mt-4">Dados que podem ser armazenados localmente:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Configurações do software</li>
              <li>Drivers criados ou importados</li>
              <li>Índices de animes criados</li>
              <li>Histórico de visualização local</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Uso de Dados</h2>
            <p>
              Os dados armazenados localmente são usados exclusivamente para o funcionamento 
              do software no seu computador. Não temos acesso a esses dados.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Compartilhamento de Dados</h2>
            <p>
              Não compartilhamos, vendemos ou transferimos seus dados pessoais para terceiros, 
              pois não coletamos dados.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Segurança</h2>
            <p>
              Como todos os dados ficam armazenados localmente no seu computador, a segurança 
              desses dados é de sua responsabilidade. Recomendamos manter seu sistema operacional 
              e antivírus atualizados.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Cookies e Rastreamento</h2>
            <p>
              O software desktop não usa cookies ou tecnologias de rastreamento. Sites que você 
              indexa podem ter suas próprias políticas de cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Seus Direitos</h2>
            <p>
              Como não coletamos dados, você tem controle total sobre todas as informações 
              armazenadas localmente. Você pode deletar todos os dados desinstalando o software 
              e removendo a pasta de dados do aplicativo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Alterações na Política</h2>
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente. Recomendamos 
              revisar esta página regularmente para se manter informado.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Contato</h2>
            <p>
              Para questões sobre esta Política de Privacidade, entre em contato através do 
              nosso repositório no GitHub ou email de suporte.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
