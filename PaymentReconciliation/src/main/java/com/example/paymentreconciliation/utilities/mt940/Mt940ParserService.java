package com.example.paymentreconciliation.utilities.mt940;

import com.prowidesoftware.swift.model.SwiftMessage;
import com.prowidesoftware.swift.model.mt.mt9xx.MT940;
import java.io.InputStream;
import org.springframework.stereotype.Service;

/**
 * Spring managed facade for the {@link Mt940Parser} utility so other beans can inject
 * MT940 parsing capabilities without depending on static helpers.
 */
@Service
public class Mt940ParserService {

    public SwiftMessage parseMessage(String source) {
        return Mt940Parser.parseMessage(source);
    }

    public SwiftMessage parseMessage(InputStream inputStream) {
        return Mt940Parser.parseMessage(inputStream);
    }

    public MT940 parseStatement(String source) {
        return Mt940Parser.parseStatement(source);
    }

    public MT940 parseStatement(InputStream inputStream) {
        return Mt940Parser.parseStatement(inputStream);
    }
}
