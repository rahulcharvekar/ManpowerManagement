package com.example.paymentreconciliation.utilities.mt940;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.prowidesoftware.swift.model.SwiftMessage;
import com.prowidesoftware.swift.model.field.Field25;
import com.prowidesoftware.swift.model.field.Field61;
import com.prowidesoftware.swift.model.mt.mt9xx.MT940;
import java.util.List;

/**
 * Simple DTO representing high level details from a parsed MT940 document.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public final class Mt940ParseResponse {

    private final String payloadType;
    private final String messageType;
    private final String account;
    private final Integer transactionCount;
    private final String fin;

    private Mt940ParseResponse(String payloadType, String messageType, String account, Integer transactionCount, String fin) {
        this.payloadType = payloadType;
        this.messageType = messageType;
        this.account = account;
        this.transactionCount = transactionCount;
        this.fin = fin;
    }

    public static Mt940ParseResponse fromMessage(SwiftMessage message) {
        String messageType = message != null ? message.getType() : null;
        String fin = message != null ? message.message() : null;
        return new Mt940ParseResponse("SWIFT_MESSAGE", messageType, null, null, fin);
    }

    public static Mt940ParseResponse fromStatement(MT940 statement) {
        String messageType = statement != null ? statement.getMessageType() : null;
        String fin = statement != null ? statement.message() : null;
        String account = null;
        Integer transactionCount = null;
        if (statement != null) {
            Field25 field25 = statement.getField25();
            if (field25 != null) {
                account = field25.getAccount();
            }
            List<Field61> field61 = statement.getField61();
            if (field61 != null && !field61.isEmpty()) {
                transactionCount = field61.size();
            }
        }
        return new Mt940ParseResponse("MT940_STATEMENT", messageType, account, transactionCount, fin);
    }

    public String getPayloadType() {
        return payloadType;
    }

    public String getMessageType() {
        return messageType;
    }

    public String getAccount() {
        return account;
    }

    public Integer getTransactionCount() {
        return transactionCount;
    }

    public String getFin() {
        return fin;
    }
}
