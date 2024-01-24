package io.openex.database.repository;

import io.openex.database.model.KillChainPhase;
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
public interface KillChainPhaseRepository extends CrudRepository<KillChainPhase, String>, JpaSpecificationExecutor<KillChainPhase> {

    @NotNull
    Optional<KillChainPhase> findById(@NotNull String id);

    Optional<KillChainPhase> findByStixId(@NotNull String stixId);

    @Query(value = "select k.id from KillChainPhase k where k.killChainName = :killChainName and k.shortName = :shortName")
    Optional<String> findIdByKillChainNameAndShortName(@NotNull String killChainName, @NotNull String shortName);

    @Modifying
    @Query(value = "UPDATE kill_chain_phases "
        + "SET"
        + "  phase_stix_id = :phaseStixId, "
        + "  phase_shortname = :phaseShortName, "
        + "  phase_name = :phaseName, "
        + "  phase_external_id = :phaseExternalId, "
        + "  phase_description = :phaseDescription "
        + "WHERE "
        + "  phase_id = :id", nativeQuery = true)
    @Transactional
    void updateKillChainPhase(
        @Param("id") String id,
        @Param("phaseStixId") String phaseStixId,
        @Param("phaseShortName") String phaseShortName,
        @Param("phaseName") String phaseName,
        @Param("phaseExternalId") String phaseExternalId,
        @Param("phaseDescription") String phaseDescription
    );

    Optional<KillChainPhase> findByKillChainNameAndShortName(@NotNull String killChainName, @NotNull String shortName);
}
