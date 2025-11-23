import { Button } from "@anidock/shared-ui";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
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

        <h1 className="text-4xl font-display font-bold mb-8">Política de Privacidade</h1>
        
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introdução</h2>
            <p>
              Esta Política de Privacidade descreve como o AniDock coleta, usa e protege suas informações pessoais. 
              Ao utilizar nosso software, você concorda com as práticas descritas nesta política.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Princípio de Privacidade Local</h2>
            <p>
              O AniDock foi projetado com privacidade em mente. O software opera prioritariamente de forma local:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Todos os dados indexados são armazenados localmente no seu computador</li>
              <li>Drivers e configurações ficam no seu dispositivo</li>
              <li>Histórico de visualização é mantido apenas localmente</li>
              <li>Nenhuma telemetria ou rastreamento é realizado por padrão</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Informações Coletadas</h2>
            
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3.1 Uso Não Autenticado</h3>
            <p>
              Quando você usa o AniDock sem criar uma conta, NENHUMA informação pessoal é coletada ou transmitida 
              para nossos servidores. Tudo permanece 100% local no seu computador.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3.2 Uso Autenticado (Opcional)</h3>
            <p>
              Se você optar por criar uma conta para recursos de nuvem (backup, sincronização), coletamos:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Endereço de e-mail (para autenticação)</li>
              <li>Nickname escolhido</li>
              <li>Drivers criados (se optar por sincronização)</li>
              <li>Índices de animes (se optar por backup)</li>
              <li>Preferências e configurações (se optar por sincronização)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Como Usamos Suas Informações</h2>
            <p>
              As informações coletadas (apenas para usuários autenticados) são usadas para:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Fornecer serviços de backup e sincronização na nuvem</li>
              <li>Autenticar sua identidade ao acessar recursos premium</li>
              <li>Processar solicitações de geração de drivers via IA (planos pagos)</li>
              <li>Melhorar nossos serviços e funcionalidades</li>
              <li>Enviar comunicações relacionadas ao serviço (recuperação de senha, etc.)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Compartilhamento de Informações</h2>
            <p>
              Nós NÃO vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Quando exigido por lei ou ordem judicial</li>
              <li>Para proteger nossos direitos legais e propriedade</li>
              <li>Com provedores de serviço necessários para operação (hospedagem, processamento de IA)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Segurança de Dados</h2>
            <p>
              Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Criptografia de dados em trânsito (HTTPS/TLS)</li>
              <li>Criptografia de senhas usando algoritmos seguros</li>
              <li>Acesso restrito a dados pessoais apenas para pessoal autorizado</li>
              <li>Auditorias regulares de segurança</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Seus Direitos</h2>
            <p>
              Você tem o direito de:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Acessar seus dados pessoais armazenados em nossos servidores</li>
              <li>Corrigir informações incorretas ou desatualizadas</li>
              <li>Solicitar a exclusão completa de sua conta e dados</li>
              <li>Exportar seus dados em formato legível</li>
              <li>Revogar consentimento para processamento de dados</li>
              <li>Usar o software completamente offline sem criar conta</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Retenção de Dados</h2>
            <p>
              Mantemos seus dados pessoais apenas pelo tempo necessário para fornecer os serviços. Dados de contas 
              inativas por mais de 12 meses podem ser excluídos. Você pode solicitar exclusão a qualquer momento.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Cookies e Tecnologias de Rastreamento</h2>
            <p>
              O AniDock é um software desktop e não utiliza cookies. Para funcionalidades de autenticação em recursos 
              online, utilizamos tokens de sessão armazenados localmente de forma segura.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Privacidade de Menores</h2>
            <p>
              Nosso serviço não é direcionado a menores de 18 anos. Não coletamos intencionalmente informações de 
              menores. Se você é pai/mãe e acredita que seu filho forneceu informações, entre em contato conosco.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas através 
              do software ou por e-mail. O uso continuado após alterações constitui aceitação da nova política.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Contato</h2>
            <p>
              Para questões sobre privacidade, exercer seus direitos ou reportar preocupações, entre em contato 
              através do nosso site oficial ou e-mail de suporte.
            </p>
          </section>

          <p className="text-sm mt-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
