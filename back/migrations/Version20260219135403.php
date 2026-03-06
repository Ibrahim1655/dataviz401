<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260219135403 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE statistiques_departement (id INT AUTO_INCREMENT NOT NULL, annee_publication SMALLINT NOT NULL, nombre_habitants INT DEFAULT NULL, densite_population NUMERIC(10, 2) DEFAULT NULL, variation_population_10_ans NUMERIC(6, 2) DEFAULT NULL, contribution_solde_naturel NUMERIC(6, 2) DEFAULT NULL, contribution_solde_migratoire NUMERIC(6, 2) DEFAULT NULL, pourcentage_moins_20_ans NUMERIC(5, 2) DEFAULT NULL, pourcentage_plus_60_ans NUMERIC(5, 2) DEFAULT NULL, taux_chomage_t4 NUMERIC(5, 2) DEFAULT NULL, taux_pauvrete NUMERIC(5, 2) DEFAULT NULL, nombre_logements INT DEFAULT NULL, nombre_residences_principales INT DEFAULT NULL, taux_logements_sociaux NUMERIC(5, 2) DEFAULT NULL, taux_logements_vacants NUMERIC(5, 2) DEFAULT NULL, taux_logements_individuels NUMERIC(5, 2) DEFAULT NULL, moyenne_annuelle_construction_neuve_10_ans INT DEFAULT NULL, construction NUMERIC(8, 2) DEFAULT NULL, parc_social_nombre_logements INT DEFAULT NULL, parc_social_logements_mis_location INT DEFAULT NULL, parc_social_logements_demolis INT DEFAULT NULL, parc_social_ventes_personnes_physiques INT DEFAULT NULL, parc_social_taux_logements_vacants NUMERIC(5, 2) DEFAULT NULL, parc_social_taux_logements_individuels NUMERIC(5, 2) DEFAULT NULL, parc_social_loyer_moyen NUMERIC(6, 2) DEFAULT NULL, parc_social_age_moyen NUMERIC(5, 2) DEFAULT NULL, parc_social_taux_logements_energivores NUMERIC(5, 2) DEFAULT NULL, code_departement VARCHAR(3) NOT NULL, INDEX IDX_464AB38F8837B2D3 (code_departement), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE statistiques_departement ADD CONSTRAINT FK_464AB38F8837B2D3 FOREIGN KEY (code_departement) REFERENCES departement (code) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE statistiques_departement DROP FOREIGN KEY FK_464AB38F8837B2D3');
        $this->addSql('DROP TABLE statistiques_departement');
    }
}
