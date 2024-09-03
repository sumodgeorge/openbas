package io.openbas.utils.schema;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.annotation.Queryable;
import jakarta.persistence.Column;
import jakarta.persistence.JoinTable;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import static org.springframework.util.StringUtils.hasText;

public class SchemaUtils {

  private SchemaUtils() {

  }

  private static final List<Class<?>> REQUIRED_ANNOTATIONS = List.of(
      NotNull.class,
      NotBlank.class,
      Email.class
  );

  private static final ConcurrentHashMap<Class<?>, List<PropertySchema>> cacheMap = new ConcurrentHashMap<>();

  // -- SCHEMA --

  public static List<PropertySchema> schema(@NotNull Class<?> clazz) {
    return cacheMap.computeIfAbsent(clazz, SchemaUtils::computeSchema);
  }

  private static List<PropertySchema> computeSchema(Class<?> clazz) {
    List<PropertySchema> properties = new ArrayList<>();

    while (clazz != null) {
      properties.addAll(computeProperties(clazz.getDeclaredFields()));
      properties.addAll(computeMethods(clazz.getDeclaredMethods()));
      clazz = clazz.getSuperclass();
    }

    return properties;
  }

  // -- PROPERTIES --

  private static List<PropertySchema> computeProperties(@NotNull Field[] fields) {
    return Arrays.stream(fields)
        .map(SchemaUtils::buildPropertySchemaFromField)
        .collect(Collectors.toList());
  }

  private static PropertySchema buildPropertySchemaFromField(Field field) {
    PropertySchema.PropertySchemaBuilder builder = PropertySchema.builder()
        .name(field.getName())
        .type(field.getType())
        .multiple(field.getType().isArray() || Collection.class.isAssignableFrom(field.getType()));

    if (field.getType().isEnum() || (field.getType().isArray() && field.getType().getComponentType().isEnum())) {
      builder.availableValues(
          getEnumNames(field.getType().isArray() ? field.getType().getComponentType() : field.getType()));
    }

    for (Annotation annotation : field.getDeclaredAnnotations()) {
      processAnnotations(builder, annotation, field);
    }

    return builder.build();
  }

  // -- METHODS --

  private static List<PropertySchema> computeMethods(@NotNull Method[] methods) {
    return Arrays.stream(methods)
        .map(SchemaUtils::buildPropertySchemaFromMethod)
        .collect(Collectors.toList());
  }

  private static PropertySchema buildPropertySchemaFromMethod(Method method) {
    PropertySchema.PropertySchemaBuilder builder = PropertySchema.builder()
        .name(method.getName())
        .type(method.getReturnType())
        .multiple(method.getReturnType().isArray() || Collection.class.isAssignableFrom(method.getReturnType()));

    if (method.getReturnType().isEnum()) {
      builder.availableValues(getEnumNames(method.getReturnType()));
    } else if (method.getReturnType().isArray() || method.getGenericReturnType() instanceof ParameterizedType) {
      Class enumType = null;
      if (method.getReturnType().isArray()) {
        enumType = method.getReturnType().getComponentType();
      } else {
        Type typeArgument = ((ParameterizedType) method.getGenericReturnType()).getActualTypeArguments()[0];
        if (typeArgument instanceof Class<?>) {
          enumType = (Class<?>) typeArgument;
        }
      }
      if (enumType != null && enumType.isEnum()) {
        builder.availableValues(getEnumNames(enumType));
      }
    }

    for (Annotation annotation : method.getDeclaredAnnotations()) {
      processAnnotations(builder, annotation, method);
    }

    return builder.build();
  }

  private static List<String> getEnumNames(Class<?> enumType) {
    return Arrays.stream(enumType.getEnumConstants())
        .map(Object::toString)
        .collect(Collectors.toList());
  }

  private static void processAnnotations(
      @NotNull final PropertySchema.PropertySchemaBuilder builder,
      @NotNull final Annotation annotation,
      @NotNull final Object member) {

    if (annotation.annotationType().equals(JsonProperty.class)) {
      builder.jsonName(((JsonProperty) annotation).value());
    } else if (annotation.annotationType().equals(Column.class)) {
      builder.unicity(((Column) annotation).unique());
    } else if (REQUIRED_ANNOTATIONS.contains(annotation.annotationType())) {
      builder.mandatory(true);
    } else if (annotation.annotationType().equals(Queryable.class)) {
      Queryable queryable = member instanceof Field
          ? ((Field) member).getAnnotation(Queryable.class)
          : ((Method) member).getAnnotation(Queryable.class);
      if (queryable != null) {
        builder.searchable(queryable.searchable())
            .filterable(queryable.filterable())
            .dynamicValues(queryable.dynamicValues())
            .sortable(queryable.sortable())
            .path(queryable.path());
        if (member instanceof Method) {
          builder.type(queryable.clazz()); // Override
        } else if (member instanceof Field && hasText(queryable.path())) {
          builder.type(queryable.clazz()); // Override
        }
      }
    } else if (annotation.annotationType().equals(JoinTable.class)) {
      builder.joinTable(PropertySchema.JoinTable.builder().joinOn(((Field) member).getName()).build());
    }
  }

  public static PropertySchema retrieveProperty(List<PropertySchema> propertySchemas, String jsonFieldPath) {
    if (jsonFieldPath.contains("\\.")) {
      throw new IllegalArgumentException("Deep path is not allowed");
    }

    return propertySchemas.stream()
        .filter(p -> jsonFieldPath.equals(p.getJsonName()))
        .findFirst()
        .orElseThrow(
            () -> new IllegalArgumentException("This path is not handled by Queryable annotation: " + jsonFieldPath));
  }

  public static List<PropertySchema> getSearchableProperties(List<PropertySchema> propertySchemas) {
    return propertySchemas.stream().filter(PropertySchema::isSearchable).collect(Collectors.toList());
  }

  public static List<PropertySchema> getFilterableProperties(List<PropertySchema> propertySchemas) {
    return propertySchemas.stream().filter(PropertySchema::isFilterable).collect(Collectors.toList());
  }

  public static List<PropertySchema> getSortableProperties(List<PropertySchema> propertySchemas) {
    return propertySchemas.stream().filter(PropertySchema::isSortable).collect(Collectors.toList());
  }
}
