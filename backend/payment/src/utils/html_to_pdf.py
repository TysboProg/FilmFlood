from jinja2 import Environment, FileSystemLoader
import shutil
import pdfkit
from datetime import datetime

wkhtmltopdf_path = shutil.which("wkhtmltopdf") or r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe" or r"usr/bin/wkhtmltopdf"

if not wkhtmltopdf_path:
    raise FileNotFoundError("wkhtmltopdf не найден! Убедитесь, что он установлен и доступен в PATH.")

config = pdfkit.configuration(wkhtmltopdf=wkhtmltopdf_path)

def html_to_pdf_reportlab(order_number: list[str], amount_value: float, payment_date: list[str]) -> bytes:
    """
    Генерирует PDF из HTML-шаблона и возвращает содержимое PDF в виде байтов.
    """
    if isinstance(payment_date, str):
        order_date = datetime.fromisoformat(payment_date)

        if order_date.tzinfo is not None:
            payment_date = order_date.replace(tzinfo=None)

    env = Environment(loader=FileSystemLoader("templates"))
    template = env.get_template("payment-receipt.html")

    context = {
        "order_number": order_number,
        "amountValue": amount_value,
        "paymentDate": payment_date,
    }

    html_content = template.render(context)

    pdf_bytes = pdfkit.from_string(html_content, output_path=None, configuration=config)

    return pdf_bytes