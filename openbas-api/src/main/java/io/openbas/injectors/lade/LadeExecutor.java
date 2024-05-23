package io.openbas.injectors.lade;

import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.Execution;
import io.openbas.database.model.Inject;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.Injector;
import io.openbas.injectors.lade.service.LadeService;
import io.openbas.model.ExecutionProcess;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

import static io.openbas.database.model.InjectStatusExecution.traceError;
import static io.openbas.database.model.InjectStatusExecution.traceInfo;

@Component(LadeContract.TYPE)
@RequiredArgsConstructor
public class LadeExecutor extends Injector {

  private final LadeService ladeService;

  @Override
  public ExecutionProcess process(
      @NotNull final Execution execution,
      @NotNull final ExecutableInject injection) {
    Inject inject = injection.getInjection().getInject();
    String bundleIdentifier = ""; // contract.getContext().get("bundle_identifier");
    String ladeType = ""; // contract.getContext().get("lade_type");
    ObjectNode content = inject.getContent();
    try {
      String actionWorkflowId;
      switch (ladeType) {
        case "action" -> actionWorkflowId = ladeService.executeAction(bundleIdentifier, inject.getInjectorContract().getId(), content);
        case "scenario" ->
            actionWorkflowId = ladeService.executeScenario(bundleIdentifier, inject.getInjectorContract().getId(), content);
        default -> throw new UnsupportedOperationException(ladeType + " not supported");
      }
      String message = "Lade " + ladeType + " sent with workflow (" + actionWorkflowId + ")";
      execution.addTrace(traceInfo(message, List.of(actionWorkflowId)));
    } catch (Exception e) {
      execution.addTrace(traceError(e.getMessage()));
    }
    return new ExecutionProcess(true, List.of());
  }
}
