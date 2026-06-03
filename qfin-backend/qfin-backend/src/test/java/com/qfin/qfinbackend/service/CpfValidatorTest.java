package com.qfin.qfinbackend.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CpfValidatorTest {

    private final CpfValidator validator = new CpfValidator();

    @Test
    void deveAceitarCpfValidoSemFormatacao() {
        assertTrue(validator.isValid("52998224725"));
    }

    @Test
    void deveAceitarCpfValidoComFormatacao() {
        assertTrue(validator.isValid("529.982.247-25"));
    }

    @Test
    void deveRejeitarCpfComDigitoVerificadorErrado() {
        assertFalse(validator.isValid("52998224724"));
    }

    @Test
    void deveRejeitarCpfComTodosDigitosIguais() {
        assertFalse(validator.isValid("11111111111"));
        assertFalse(validator.isValid("00000000000"));
    }

    @Test
    void deveRejeitarCpfComTamanhoIncorreto() {
        assertFalse(validator.isValid("123"));
        assertFalse(validator.isValid("123456789012"));
    }

    @Test
    void deveTratarCpfNuloComoValidoPoisEhOpcional() {
        assertTrue(validator.isValid(null));
    }

    @Test
    void deveFormatarCpfCorretamente() {
        assertEquals("529.982.247-25", validator.format("52998224725"));
        assertEquals("529.982.247-25", validator.format("529.982.247-25"));
    }
}
