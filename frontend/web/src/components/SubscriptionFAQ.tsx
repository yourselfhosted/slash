import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const SubscriptionFAQ = () => {
  return (
    <div className="w-full flex flex-col justify-center items-center">
      <h2 className="text-2xl font-semibold mb-8 dark:text-gray-400">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full max-w-2xl">
        <AccordionItem value="item-1">
          <AccordionTrigger>Can I use the Free plan in my team?</AccordionTrigger>
          <AccordionContent>
            Of course you can. In the free plan, you can invite up to 5 members to your team. If you need more, you should upgrade to the
            Pro plan.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>How many devices can the license key be used on?</AccordionTrigger>
          <AccordionContent>{`It's unlimited for now, but please do not abuse it.`}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>{`Can I get a refund if Slash doesn't meet my needs?`}</AccordionTrigger>
          <AccordionContent>
            Yes, absolutely! You can contact us with `yourselfhosted@gmail.com`. I will refund you as soon as possible.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger>Is there a Lifetime license?</AccordionTrigger>
          <AccordionContent>
            {`As software requires someone to maintain it, so we won't sell a lifetime service, since humans are not immortal yet. But if you
            really want it, please contact us "yourselfhosted@gmail.com".`}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default SubscriptionFAQ;
