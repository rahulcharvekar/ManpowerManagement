package com.example.paymentreconciliation.utilities.mt940;

import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;
import com.prowidesoftware.swift.io.parser.SwiftParser;
import com.prowidesoftware.swift.model.SwiftMessage;
import com.prowidesoftware.swift.model.mt.mt9xx.MT940;
import java.io.IOException;
import java.io.InputStream;
import java.util.Objects;
import org.slf4j.Logger;

public final class Mt940Parser {

    private static final Logger log = LoggerFactoryProvider.getLogger(Mt940Parser.class);

    private Mt940Parser() {
    }

    public static SwiftMessage parseMessage(String source) {
        Objects.requireNonNull(source, "MT940 source must not be null");
        try {
            SwiftMessage message = new SwiftParser(source).message();
            if (message != null && message.getBlock1() != null) {
                log.debug("Parsed SwiftMessage with reference: {}");
            } else {
                log.debug("Parsed SwiftMessage without basic header block");
            }
            return message;
        } catch (IOException e) {
            throw new IllegalArgumentException("Unable to parse MT940 message", e);
        }
    }

    public static SwiftMessage parseMessage(InputStream inputStream) {
        Objects.requireNonNull(inputStream, "InputStream must not be null");
        try {
            SwiftParser parser = new SwiftParser(inputStream);
            SwiftMessage message = parser.message();
            if (message != null && message.getBlock1() != null) {
                log.debug("Parsed SwiftMessage with reference: {}");
            } else {
                log.debug("Parsed SwiftMessage without basic header block");
            }
            return message;
        } catch (IOException e) {
            throw new IllegalArgumentException("Unable to parse MT940 message", e);
        }
    }

    public static MT940 parseStatement(String source) {
        Objects.requireNonNull(source, "MT940 source must not be null");
        MT940 statement = MT940.parse(source);
        log.debug("Parsed MT940 statement for account: {}", statement.getField25() != null ? statement.getField25().getAccount() : "n/a");
        return statement;
    }

    public static MT940 parseStatement(InputStream inputStream) {
        Objects.requireNonNull(inputStream, "InputStream must not be null");
        try {
            MT940 statement = MT940.parse(inputStream);
            if (statement != null && statement.getField25() != null) {
                log.debug("Parsed MT940 statement for account: {}", statement.getField25().getAccount());
            } else {
                log.debug("Parsed MT940 statement without account identification");
            }
            return statement;
        } catch (IOException e) {
            throw new IllegalArgumentException("Unable to parse MT940 statement", e);
        }
    }
}
