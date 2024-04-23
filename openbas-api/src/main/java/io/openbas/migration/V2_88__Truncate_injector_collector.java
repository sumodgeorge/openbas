package io.openbas.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

import java.sql.Statement;

@Component
public class V2_88__Truncate_injector_collector extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Statement select = context.getConnection().createStatement();
    select.execute("TRUNCATE injectors CASCADE;");
    select.execute("TRUNCATE collectors CASCADE;");
  }
}
