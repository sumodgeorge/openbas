package io.openex.database.repository;

import io.openex.database.model.AttackPattern;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface AttackPatternRepository extends CrudRepository<AttackPattern, String>, JpaSpecificationExecutor<AttackPattern> {

    @NotNull
    Optional<AttackPattern> findById(@NotNull String id);

    Optional<AttackPattern> findByExternalId(@NotNull String externalId);

    @Query("select p.id from AttackPattern p WHERE p.externalId = :externalId")
    Optional<String> findId(@Param("externalId") String externalId);

    Optional<AttackPattern> findByStixId(@NotNull String stixId);

    @Query(value = "select a.id from AttackPattern a where a.stixId = :stixId")
    Optional<String> findIdByStixId(@NotNull String stixId);

    @Query(value = "select a.id from AttackPattern a where a.externalId = :externalId")
    Optional<String> findIdByExternalId(@NotNull String externalId);

    @Modifying
    @Query(value = "UPDATE attack_patterns "
        + "SET"
        + "  attack_pattern_stix_id = :attackPatternStixId, "
        + "  attack_pattern_name = :attackPatternName, "
        + "  attack_pattern_description = :attackPatternDescription, "
        + "  attack_pattern_platforms = :attackPatternPlatforms, "
        + "  attack_pattern_permissions_required = :attackPatternPermissionsRequired "
        + "WHERE "
        + "  attack_pattern_id = :id", nativeQuery = true)
    @Transactional
    void updateAttackPattern(
        @Param("id") String id,
        @Param("attackPatternStixId") String attackPatternStixId,
        @Param("attackPatternName") String attackPatternName,
        @Param("attackPatternDescription") String attackPatternDescription,
        @Param("attackPatternPlatforms") String[] attackPatternPlatforms,
        @Param("attackPatternPermissionsRequired") String[] attackPatternPermissionsRequired
    );

    @Transactional
    @Modifying
    @Query(value =
        "WITH newRelationships AS (" +
            "    SELECT " +
            "        :attackPatternId AS attack_pattern_id, " +
            "        unnest(:newPhaseIds) AS phase_id " +
            ")" +
            "DELETE FROM attack_patterns_kill_chain_phases a " +
            "WHERE a.attack_pattern_id = :attackPatternId; " +
            "INSERT INTO attack_patterns_kill_chain_phases (attack_pattern_id, phase_id) " +
            "SELECT n.attack_pattern_id, n.phase_id FROM newRelationships n", nativeQuery = true)
    void updateRelations(
        @Param("attackPatternId") String attackPatternId,
        @Param("newPhaseIds") String[] newPhaseIds
    );

    @Modifying
    @Query(value = "UPDATE attack_patterns "
        + "SET"
        + "  attack_pattern_parent = :attackPatternParentId "
        + "WHERE "
        + "  attack_pattern_id = :id", nativeQuery = true)
    @Transactional
    void updateAttackPatternParent(
        @Param("id") String id,
        @Param("attackPatternParentId") String attackPatternParentId
    );
}
