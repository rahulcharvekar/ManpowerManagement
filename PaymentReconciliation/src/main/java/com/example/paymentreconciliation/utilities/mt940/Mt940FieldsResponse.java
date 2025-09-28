package com.example.paymentreconciliation.utilities.mt940;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.prowidesoftware.swift.model.SwiftMessage;
import com.prowidesoftware.swift.model.Tag;
import com.prowidesoftware.swift.model.SwiftBlock4;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * DTO that exposes all tag/value pairs from an MT940 payload for JSON serialization.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public final class Mt940FieldsResponse {

    private final String messageType;
    private final List<FieldEntry> fields;

    private Mt940FieldsResponse(String messageType, List<FieldEntry> fields) {
        this.messageType = messageType;
        this.fields = fields;
    }

    public static Mt940FieldsResponse fromMessage(SwiftMessage message) {
        if (message == null) {
            return new Mt940FieldsResponse(null, List.of());
        }
        SwiftBlock4 block4 = message.getBlock4();
        List<FieldEntry> entries = new ArrayList<>();
        if (block4 != null) {
            for (Tag tag : block4.getTags()) {
                entries.add(new FieldEntry(tag.getName(), tag.getValue()));
            }
        }
        return new Mt940FieldsResponse(message.getType(), Collections.unmodifiableList(entries));
    }

    public String getMessageType() {
        return messageType;
    }

    public List<FieldEntry> getFields() {
        return fields;
    }

    /**
     * Individual field entry from block 4 of the MT940 message.
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static final class FieldEntry {

        private final String tag;
        private final String value;

        private FieldEntry(String tag, String value) {
            this.tag = tag;
            this.value = value;
        }

        public String getTag() {
            return tag;
        }

        public String getValue() {
            return value;
        }
    }
}
