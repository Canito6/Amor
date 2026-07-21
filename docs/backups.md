# Checklist de Backups do MongoDB Atlas — "O Nosso Cantinho"

Este guia descreve os passos necessários para configurar e gerir backups da base de dados do projeto **O Nosso Cantinho** diretamente no painel do MongoDB Atlas.

---

## 1. Ativação de Backups Automáticos no Cluster

### Tiers do Atlas (Gratuito M0 vs. Pago M10+)
- **M0 Sandbox (Free Tier)**: O Atlas **não disponibiliza backups automáticos nem Point-in-Time Restore** na vertente gratuita (M0/M2/M5). Para um projeto pessoal com memórias e fotos importantes, a proteção contra perda acidental de dados requer exportações manuais (via `mongodump`) ou upgrade para um cluster dedicado.
- **M10+ (Dedicated Cluster)**: Disponibiliza backups automáticos com **Continuous Cloud Backups** e **Point-in-Time Restore (PITR)**.

### Passo-a-passo para ativar no painel Atlas (Cluster M10+ ou superior):
1. Acede ao painel do [MongoDB Atlas](https://cloud.mongodb.com/).
2. No menu lateral esquerdo, seleciona **Database** e localiza o cluster do projeto (`Amor` / `O Nosso Cantinho`).
3. Clica em **Configuration** (ou no nome do cluster) e vai à tab **Backup**.
4. Ativa a opção **Cloud Backups**.
5. Em **Backup Policy**, define a frequência das cópias de segurança (ex: Snapshots diários retidos por 7 a 30 dias).
6. Guarda as alterações clicando em **Save**.

---

## 2. Como Fazer um Restore Pontual (Point-in-Time Restore / PITR)

Caso ocorra uma eliminação acidental de dados ou corrupção no banco de dados:

1. No painel do Atlas, navega até **Database** > seleciona o teu cluster.
2. Clica no separador **Backup**.
3. Clica no botão **Restore** (no canto superior direito da secção de backups).
4. Seleciona o tipo de restauro:
   - **Point-in-Time**: Escolhe a data e hora exatas (até ao segundo) anteriores ao incidente.
   - **Snapshot**: Escolhe uma cópia diária/horária específica guardada anteriormente.
5. Seleciona o destino do restauro:
   - **Restore to a new cluster** (Recomendado): Restaura para um cluster temporário paralelo para inspecionar os dados sem sobrescrever a produção imediatamente.
   - **In-place Restore**: Subtitui diretamente os dados do cluster atual (CUIDADO: sobrescreve dados atuais).
6. Confirma o restauro e aguarda a conclusão do processo.

---

## 3. Recomendação de Frequência e Política de Retenção

Para um projeto pessoal focado em **memórias, fotos e diários do casal**:

- **Frequência de Snapshots**: **Diária (Daily)** no mínimo.
- **Continuous Backups (Oplog)**: Ativado para permitir restauro ao segundo exato se necessário.
- **Retenção Sugerida**:
  - **Diários**: Manter durante 14 a 30 dias.
  - **Mensais**: Manter 1 snapshot por mês durante 6 a 12 meses.
- **Estratégia Adicional (Free Tier M0)**:
  - Se mantiveres a base de dados no plano gratuito M0, agenda uma rotina semanal/mensal de download dos dados via `mongodump` para armazenamento local seguro:
    ```bash
    mongodump --uri="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/amor" --out=./backup_local
    ```
