package com.example.paymentreconciliation.utilities.mt940;

import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;
import com.prowidesoftware.swift.model.SwiftMessage;
import com.prowidesoftware.swift.model.mt.mt9xx.MT940;
import java.io.IOException;
import java.io.InputStream;
import java.util.Objects;
import org.slf4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/mt940")
public class Mt940Controller {

    private static final Logger log = LoggerFactoryProvider.getLogger(Mt940Controller.class);

    private final Mt940ParserService parserService;

    public Mt940Controller(Mt940ParserService parserService) {
        this.parserService = parserService;
    }

    @PostMapping(path = "/parse", consumes = MediaType.TEXT_PLAIN_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Mt940FieldsResponse> parseFields(@RequestBody String payload) {
        if (!StringUtils.hasText(payload)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "MT940 payload must not be blank");
        }
        log.info("Parsing MT940 payload for tag listing");
        SwiftMessage message = parserService.parseMessage(payload);
        return ResponseEntity.ok(Mt940FieldsResponse.fromMessage(message));
    }

    @PostMapping(path = "/messages", consumes = MediaType.TEXT_PLAIN_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Mt940ParseResponse> parseMessage(@RequestBody String payload) {
        if (!StringUtils.hasText(payload)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "MT940 message content must not be blank");
        }
        log.info("Parsing MT940 swift message payload");
        SwiftMessage message = parserService.parseMessage(payload);
        return ResponseEntity.ok(Mt940ParseResponse.fromMessage(message));
    }

    @PostMapping(path = "/statements", consumes = MediaType.TEXT_PLAIN_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Mt940ParseResponse> parseStatement(@RequestBody String payload) {
        if (!StringUtils.hasText(payload)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "MT940 statement content must not be blank");
        }
        log.info("Parsing MT940 statement payload from text");
        MT940 statement = parserService.parseStatement(payload);
        return ResponseEntity.ok(Mt940ParseResponse.fromStatement(statement));
    }

    @PostMapping(path = "/statements/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Mt940ParseResponse> parseStatementFile(@RequestParam("file") MultipartFile file) {
        Objects.requireNonNull(file, "file must not be null");
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Uploaded file is empty");
        }
        log.info("Parsing MT940 statement payload from uploaded file name={}", file.getOriginalFilename());
        try (InputStream inputStream = file.getInputStream()) {
            MT940 statement = parserService.parseStatement(inputStream);
            return ResponseEntity.ok(Mt940ParseResponse.fromStatement(statement));
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unable to read uploaded file", ex);
        }
    }
}
