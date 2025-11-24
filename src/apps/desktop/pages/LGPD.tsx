import { Button } from '@anidock/shared-ui';
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LGPD = () => {
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

        <h1 className="text-4xl font-display font-bold mb-8">LGPD - Lei Geral de Proteção de Dados</h1>
        
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Compromisso com a LGPD</h2>
            <p>
              O AniDock está comprometido com a conformidade à Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018). 
              Este documento explica como tratamos dados pessoais em conformidade com a legislação brasileira.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Base Legal para Tratamento de Dados</h2>
            <p>
              O tratamento de dados pessoais no AniDock é fundamentado nas seguintes bases legais da LGPD:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li><strong>Consentimento (Art. 7º, I):</strong> Para criação de conta e uso de recursos em nuvem</li>
              <li><strong>Execução de contrato (Art. 7º, V):</strong> Para fornecimento de serviços contratados</li>
              <li><strong>Legítimo interesse (Art. 7º, IX):</strong> Para melhorias no software e segurança</li>
              <li><strong>Exercício regular de direitos (Art. 7º, VI):</strong> Para defesa legal quando necessário</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Dados Pessoais Tratados</h2>
            
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3.1 Dados Fornecidos pelo Titular</h3>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>E-mail (para autenticação e comunicação)</li>
              <li>Nickname (identificação pública escolhida)</li>
              <li>Senha (criptografada)</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3.2 Dados Gerados pelo Uso</h3>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Drivers criados e suas configurações</li>
              <li>Índices de animes salvos (opcional, apenas com sincronização)</li>
              <li>Logs de acesso à conta (para segurança)</li>
              <li>Informações de uso de recursos premium</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3.3 Dados NÃO Tratados</h3>
            <p className="mt-2">
              Quando usado sem autenticação (modo local), o AniDock NÃO coleta ou trata NENHUM dado pessoal. 
              Tudo permanece no seu dispositivo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Direitos do Titular (Art. 18 da LGPD)</h2>
            <p>
              Você possui os seguintes direitos garantidos pela LGPD:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li><strong>Confirmação e acesso:</strong> Confirmar a existência de tratamento e acessar seus dados</li>
              <li><strong>Correção:</strong> Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li><strong>Anonimização, bloqueio ou eliminação:</strong> Solicitar remoção de dados desnecessários ou excessivos</li>
              <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado e interoperável</li>
              <li><strong>Eliminação:</strong> Excluir dados tratados com base em consentimento</li>
              <li><strong>Informação sobre compartilhamento:</strong> Saber com quem compartilhamos seus dados</li>
              <li><strong>Revogação do consentimento:</strong> Retirar consentimento a qualquer momento</li>
              <li><strong>Oposição:</strong> Opor-se a tratamento realizado em desconformidade com a LGPD</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Como Exercer Seus Direitos</h2>
            <p>
              Para exercer qualquer dos direitos acima, você pode:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Acessar as configurações da sua conta no próprio aplicativo</li>
              <li>Entrar em contato através do e-mail de suporte</li>
              <li>Solicitar por escrito através dos canais oficiais</li>
            </ul>
            <p className="mt-4">
              Responderemos às solicitações em até 15 dias, conforme estabelecido pela LGPD. Em casos complexos, 
              este prazo pode ser estendido por mais 15 dias, mediante comunicação prévia.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Segurança da Informação</h2>
            <p>
              Implementamos medidas técnicas e administrativas para proteger dados pessoais de:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Acesso não autorizado</li>
              <li>Situações acidentais ou ilícitas de destruição, perda, alteração ou comunicação</li>
              <li>Qualquer forma de tratamento inadequado ou ilícito</li>
            </ul>
            <p className="mt-4">
              Medidas incluem: criptografia de dados, controle de acesso, monitoramento de segurança e auditorias periódicas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Compartilhamento de Dados</h2>
            <p>
              Dados pessoais podem ser compartilhados apenas nas seguintes situações:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Com seu consentimento explícito</li>
              <li>Para cumprimento de obrigação legal ou regulatória</li>
              <li>Com prestadores de serviço necessários (sempre com contratos de proteção de dados)</li>
              <li>Para proteção de direitos em processo judicial ou administrativo</li>
            </ul>
            <p className="mt-4">
              Quando compartilhamos dados com terceiros, garantimos que estes também estejam em conformidade com a LGPD 
              através de contratos apropriados.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Transferência Internacional de Dados</h2>
            <p>
              Caso ocorra transferência de dados pessoais para outros países, garantimos que:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>A transferência atende aos requisitos da LGPD (Art. 33)</li>
              <li>O país destinatário oferece nível adequado de proteção</li>
              <li>São aplicadas salvaguardas contratuais apropriadas</li>
              <li>Você será informado previamente sobre tais transferências</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Retenção de Dados</h2>
            <p>
              Mantemos dados pessoais apenas pelo período necessário para:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Cumprir as finalidades para as quais foram coletados</li>
              <li>Cumprir obrigações legais ou regulatórias</li>
              <li>Exercer direitos em processos judiciais</li>
            </ul>
            <p className="mt-4">
              Após esse período, os dados são eliminados ou anonimizados de forma segura, conforme Art. 16 da LGPD.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Incidentes de Segurança</h2>
            <p>
              Em caso de incidente de segurança que possa acarretar risco ou dano relevante aos titulares, 
              cumpriremos o Art. 48 da LGPD:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Comunicaremos você em prazo adequado</li>
              <li>Informaremos a natureza dos dados afetados</li>
              <li>Orientaremos sobre medidas para mitigar efeitos adversos</li>
              <li>Notificaremos a Autoridade Nacional de Proteção de Dados (ANPD)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Encarregado de Dados (DPO)</h2>
            <p>
              Designamos um Encarregado de Proteção de Dados (Data Protection Officer - DPO) para:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Aceitar reclamações e comunicações dos titulares</li>
              <li>Prestar esclarecimentos e orientar sobre práticas</li>
              <li>Receber comunicações da ANPD e adotar providências</li>
              <li>Orientar funcionários sobre boas práticas de proteção de dados</li>
            </ul>
            <p className="mt-4">
              Contato do DPO: Disponível através dos canais oficiais de suporte.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Alterações nesta Política</h2>
            <p>
              Esta política pode ser atualizada para refletir mudanças em nossas práticas ou na legislação. 
              Você será notificado sobre alterações significativas por e-mail ou através do aplicativo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">13. Autoridade Nacional de Proteção de Dados</h2>
            <p>
              Se você acredita que seus direitos não foram respeitados, pode apresentar reclamação à Autoridade 
              Nacional de Proteção de Dados (ANPD):
            </p>
            <p className="mt-4">
              Website: <a href="https://www.gov.br/anpd" className="text-primary hover:underline">www.gov.br/anpd</a>
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

export default LGPD;
