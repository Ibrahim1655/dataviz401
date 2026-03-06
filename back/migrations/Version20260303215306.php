<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260303215306 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE statistiques_departement DROP taux_logements_individuels, DROP moyenne_annuelle_construction_neuve_10_ans, DROP construction, DROP parc_social_nombre_logements, DROP parc_social_logements_mis_location, DROP parc_social_logements_demolis, DROP parc_social_ventes_personnes_physiques, DROP parc_social_taux_logements_vacants, DROP parc_social_taux_logements_individuels, DROP parc_social_loyer_moyen, DROP parc_social_age_moyen, DROP parc_social_taux_logements_energivores');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE statistiques_departement ADD taux_logements_individuels NUMERIC(5, 2) DEFAULT NULL, ADD moyenne_annuelle_construction_neuve_10_ans INT DEFAULT NULL, ADD construction NUMERIC(8, 2) DEFAULT NULL, ADD parc_social_nombre_logements INT DEFAULT NULL, ADD parc_social_logements_mis_location INT DEFAULT NULL, ADD parc_social_logements_demolis INT DEFAULT NULL, ADD parc_social_ventes_personnes_physiques INT DEFAULT NULL, ADD parc_social_taux_logements_vacants NUMERIC(5, 2) DEFAULT NULL, ADD parc_social_taux_logements_individuels NUMERIC(5, 2) DEFAULT NULL, ADD parc_social_loyer_moyen NUMERIC(6, 2) DEFAULT NULL, ADD parc_social_age_moyen NUMERIC(5, 2) DEFAULT NULL, ADD parc_social_taux_logements_energivores NUMERIC(5, 2) DEFAULT NULL');
    }
}
