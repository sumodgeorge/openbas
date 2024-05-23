package io.openbas.injectors.mastodon.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import jakarta.validation.constraints.NotNull;

@Component
@ConfigurationProperties(prefix = "mastodon")
public class MastodonConfig {

    @NotNull
    private Boolean enable;

    @NotNull
    private String url;

    public Boolean getEnable() {
        return enable;
    }

    public void setEnable(Boolean enable) {
        this.enable = enable;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
