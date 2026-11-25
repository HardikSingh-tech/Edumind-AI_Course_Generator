package com.edumind.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static class WindowCounter {
        long windowStartEpochSec;
        int count;
    }

    private final Map<String, WindowCounter> counters = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String path = request.getRequestURI();
        boolean isAiOrAuth = path.startsWith("/api/auth/")
                || path.equals("/api/courses/syllabus")
                || path.endsWith("/expand-stream")
                || path.endsWith("/generate");

        if (!isAiOrAuth) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = request.getRemoteAddr();
        String key = clientIp + ":" + (path.startsWith("/api/auth/") ? "auth" : "ai");
        int limit = path.startsWith("/api/auth/") ? 20 : 15; // requests per minute
        long nowSec = Instant.now().getEpochSecond();

        WindowCounter counter = counters.computeIfAbsent(key, k -> {
            WindowCounter wc = new WindowCounter();
            wc.windowStartEpochSec = nowSec;
            wc.count = 0;
            return wc;
        });

        synchronized (counter) {
            if (nowSec - counter.windowStartEpochSec >= 60) {
                counter.windowStartEpochSec = nowSec;
                counter.count = 0;
            }
            counter.count++;
            if (counter.count > limit) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.getWriter().write("{\"success\":false,\"error\":\"Rate limit exceeded\",\"message\":\"Too many requests. Please try again in a minute.\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
