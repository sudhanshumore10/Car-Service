package com.infy.carservice.utility;


import java.util.stream.Collectors;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;


@ControllerAdvice
public class ExceptionControllerAdvice
{

    private static final Log LOGGER = LogFactory.getLog(ExceptionControllerAdvice.class);

    @Autowired
    private Environment environment;


    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorInfo> generalExceptionHandler(RuntimeException exception)
    {
			LOGGER.error(exception.getMessage(), exception);
			ErrorInfo errorInfo = new ErrorInfo();
			errorInfo.setErrorCode(HttpStatus.BAD_REQUEST.value());
			errorInfo.setErrorMessage(exception.getMessage());
			return new ResponseEntity<>(errorInfo,
						    HttpStatus.BAD_REQUEST);
    }

//    // add appropriate annotation
//    @ExceptionHandler( {MethodArgumentNotValidException.class, ConstraintViolationException.class})
//    public ResponseEntity<ErrorInfo> validatorExceptionHandler(Exception exception)
//    {
//		LOGGER.error(exception.getMessage(), exception);
//		String errorMsg;
//		if (exception instanceof MethodArgumentNotValidException)
//		{
//		    MethodArgumentNotValidException manvException = (MethodArgumentNotValidException) exception;
//		    errorMsg = manvException.getBindingResult()
//					    .getAllErrors()
//					    .stream()
//					    .map(ObjectError::getDefaultMessage)
//					    .collect(Collectors.joining(", "));
//	
//		}
//		else
//		{
//		    ConstraintViolationException cvException = (ConstraintViolationException) exception;
//		    errorMsg = cvException.getConstraintViolations()
//					  .stream()
//					  .map(ConstraintViolation::getMessage)
//					  .collect(Collectors.joining(", "));
//	
//		}
//		ErrorInfo errorInfo = new ErrorInfo();
//		errorInfo.setErrorCode(HttpStatus.BAD_REQUEST.value());
//		errorInfo.setErrorMessage(errorMsg);
//		return new ResponseEntity<>(errorInfo, HttpStatus.BAD_REQUEST);
//    }
    
    
//  @ExceptionHandler(InfyInternException.class)
//  public ResponseEntity<ErrorInfo> meetingSchedulerExceptionHandler(InfyInternException exception)
//  {
//	LOGGER.error(exception.getMessage(), exception);
//	ErrorInfo errorInfo = new ErrorInfo();
//	errorInfo.setErrorCode(HttpStatus.BAD_REQUEST.value());
//	errorInfo.setErrorMessage(environment.getProperty(exception.getMessage()));
//	System.out.println("kunal"+environment.getProperty(exception.getMessage()));
//	return new ResponseEntity<>(errorInfo, HttpStatus.BAD_REQUEST);
//  }
}
